"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  type ForumPostSummary,
  type ForumTag,
  FORUM_TAGS,
  FORUM_TAG_COLORS,
} from "@/lib/types";

type TagFilter = ForumTag | "ALL";
type SortMode = "new" | "top";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState<TagFilter>("ALL");
  const [sort, setSort] = useState<SortMode>("new");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (tag !== "ALL") params.set("tag", tag);
    if (search) params.set("search", search);
    params.set("sort", sort);

    fetch(`/api/forum/posts?${params.toString()}`)
      .then((r) => r.json())
      .then((data: ForumPostSummary[]) => {
        if (active) {
          setPosts(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [tag, sort, search]);

  const handleVote = async (postId: string, value: number) => {
    const res = await fetch(`/api/forum/posts/${postId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (res.ok) {
      const data: { vote: number | null } = await res.json();
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const oldVote = p.userVote ?? 0;
          const newVote = data.vote ?? 0;
          return {
            ...p,
            voteScore: p.voteScore - oldVote + newVote,
            userVote: data.vote,
          };
        }),
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Forum</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Discuss problems, share editorials, ask questions
          </p>
        </div>
        <Link
          href="/forum/new"
          className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setTag("ALL")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              tag === "ALL"
                ? "bg-primary text-white"
                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            All
          </button>
          {FORUM_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                tag === t
                  ? "bg-primary text-white"
                  : `${FORUM_TAG_COLORS[t]} hover:opacity-80`
              }`}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none"
          >
            <option value="new">Newest</option>
            <option value="top">Top Voted</option>
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 w-48"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-neutral-500">No posts yet.</p>
          <p className="text-sm text-neutral-400 mt-1">Be the first to start a discussion!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => {
            const tagColor = FORUM_TAG_COLORS[post.tag] ?? "bg-neutral-100 text-neutral-600";
            return (
              <div key={post.id} className="flex gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-primary/30 transition-colors">
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => handleVote(post.id, 1)}
                    className={`p-1 rounded transition-colors ${
                      post.userVote === 1
                        ? "text-primary"
                        : "text-neutral-400 hover:text-primary"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <span className={`text-sm font-semibold ${
                    post.voteScore > 0
                      ? "text-primary"
                      : post.voteScore < 0
                        ? "text-red-500"
                        : "text-neutral-400"
                  }`}>
                    {post.voteScore}
                  </span>
                  <button
                    onClick={() => handleVote(post.id, -1)}
                    className={`p-1 rounded transition-colors ${
                      post.userVote === -1
                        ? "text-red-500"
                        : "text-neutral-400 hover:text-red-500"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tagColor}`}>
                      {post.tag}
                    </span>
                  </div>
                  <Link href={`/forum/${post.id}`} className="font-medium hover:text-primary transition-colors block truncate">
                    {post.title}
                  </Link>
                  <p className="text-sm text-neutral-500 mt-0.5 line-clamp-1">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                    <span>{post.author.name}</span>
                    <span>{timeAgo(post.createdAt)}</span>
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post._count.comments}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
