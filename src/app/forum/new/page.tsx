"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type SubredditSummary, FORUM_TAGS, FORUM_TAG_COLORS } from "@/lib/types";

export default function NewForumPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("GENERAL");
  const [subredditId, setSubredditId] = useState("");
  const [subreddits, setSubreddits] = useState<SubredditSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/subreddits")
      .then((r) => r.json())
      .then((data: SubredditSummary[]) => { if (active) setSubreddits(data); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/forum/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        tag,
        subredditId: subredditId || null,
      }),
    });

    if (!res.ok) {
      const data: { error?: string } = await res.json();
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const post: { id: string } = await res.json();
    router.push(`/forum/${post.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-1 text-sm text-neutral-500">
        <Link href="/forum" className="hover:text-primary transition-colors">
          Forum
        </Link>
        <span className="text-neutral-300">/</span>
        <span className="font-medium text-neutral-900 dark:text-neutral-100">New Post</span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Create a Post</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Community */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Community</label>
          <select
            value={subredditId}
            onChange={(e) => setSubredditId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
          >
            <option value="">No specific community</option>
            {subreddits.map((s) => (
              <option key={s.id} value={s.id}>
                s/{s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tag */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Tag</label>
          <div className="flex flex-wrap gap-2">
            {FORUM_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  tag === t
                    ? "ring-2 ring-primary ring-offset-1"
                    : ""
                } ${FORUM_TAG_COLORS[t]}`}
              >
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
            placeholder="An interesting title..."
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={8}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm font-mono"
            placeholder="Write your post here..."
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors text-sm"
          >
            {loading ? "Posting..." : "Post"}
          </button>
          <Link
            href="/forum"
            className="px-5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
