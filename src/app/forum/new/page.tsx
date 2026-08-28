"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import TagPicker from "@/components/TagPicker";
import { ForumPageShell, PageContainer } from "@/components/layout";
import PostImagePicker, { type PendingPostImage } from "@/components/PostImagePicker";
import { uploadPostImage } from "@/lib/storage";
import { type SubredditSummary } from "@/lib/types";

export default function NewForumPostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("GENERAL");
  const [subredditId, setSubredditId] = useState("");
  const [subreddits, setSubreddits] = useState<SubredditSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<PendingPostImage[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/subreddits")
      .then((r) => r.json())
      .then((data: SubredditSummary[]) => {
        if (!active) return;
        setSubreddits(data);
        const preselected = searchParams.get("subredditId");
        if (preselected && data.some((s) => s.id === preselected)) {
          setSubredditId(preselected);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [searchParams]);

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

    if (images.length > 0) {
      const urls = await Promise.all(
        images.map((img, index) => uploadPostImage(post.id, index, img.file)),
      );
      const attachRes = await fetch(`/api/forum/posts/${post.id}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      if (!attachRes.ok) {
        const data: { error?: string } = await attachRes.json();
        setError(data.error ?? "Post created but images failed to upload");
        setLoading(false);
        router.push(`/forum/${post.id}`);
        return;
      }
    }

    router.push(`/forum/${post.id}`);
  };

  return (
    <ForumPageShell>
      <PageContainer width="narrow" className="py-8 sm:py-10">
        <nav className="flex items-center gap-2 mb-6 text-sm text-neutral-500">
          <Link href="/forum" className="hover:text-primary transition-colors">Forum</Link>
          <span>/</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">New post</span>
        </nav>

        <div className="rounded-xl border border-primary-200/70 dark:border-neutral-800 bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-primary-200/70 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
            <h1 className="text-xl font-display font-semibold tracking-tight">Create a post</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Share a question, editorial, or start a discussion.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2">Community</label>
              <select
                value={subredditId}
                onChange={(e) => {
                  setSubredditId(e.target.value);
                  setTag("GENERAL");
                }}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              >
                <option value="">No specific community</option>
                {subreddits.map((s) => (
                  <option key={s.id} value={s.id}>s/{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Tag</label>
              <TagPicker
                subredditId={subredditId || null}
                value={tag}
                onChange={setTag}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                placeholder="An interesting title..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={10}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm font-mono leading-relaxed resize-y"
                placeholder="Write your post here..."
              />
            </div>

            <PostImagePicker images={images} onChange={setImages} disabled={loading} />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors text-sm"
              >
                {loading ? "Posting..." : "Publish"}
              </button>
              <Link
                href="/forum"
                className="px-6 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </PageContainer>
    </ForumPageShell>
  );
}
