"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type ForumTag, FORUM_TAGS } from "@/lib/types";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState<ForumTag>("GENERAL");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/forum/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, tag }),
    });

    if (!res.ok) {
      const data: { error?: string } = await res.json();
      setError(data.error ?? "Failed to create post");
      setSubmitting(false);
      return;
    }

    const post: { id: string } = await res.json();
    router.push(`/forum/${post.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">New Discussion</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Share a question, editorial, or start a meta discussion.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
            placeholder="What's on your mind?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Tag</label>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value as ForumTag)}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
          >
            {FORUM_TAGS.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={12}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-mono text-sm transition-colors"
            placeholder="Write your post... Markdown is supported."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {submitting ? "Publishing..." : "Publish Post"}
        </button>
      </form>
    </div>
  );
}
