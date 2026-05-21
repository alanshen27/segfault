"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  type ForumPostSummary,
  type ForumTag,
  type SubredditSummary,
  type PaginatedResponse,
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
  const [subreddits, setSubreddits] = useState<SubredditSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState<TagFilter>("ALL");
  const [sort, setSort] = useState<SortMode>("new");
  const [search, setSearch] = useState("");
  const [subredditId, setSubredditId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let active = true;
    fetch("/api/subreddits")
      .then((r) => r.json())
      .then((data: SubredditSummary[]) => { if (active) setSubreddits(data); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (tag !== "ALL") params.set("tag", tag);
    if (search) params.set("search", search);
    if (subredditId) params.set("subredditId", subredditId);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("pageSize", "15");

    fetch(`/api/forum/posts?${params.toString()}`)
      .then((r) => r.json())
      .then((res: PaginatedResponse<ForumPostSummary>) => {
        if (active) {
          setPosts(res.data);
          setTotal(res.total);
          setTotalPages(res.totalPages);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [tag, sort, search, subredditId, page]);

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

  const activeSubreddit = subreddits.find((s) => s.id === subredditId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Main Feed */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {activeSubreddit ? `s/${activeSubreddit.name}` : "Forum"}
              </h1>
              {activeSubreddit ? (
                <p className="text-sm text-neutral-500 mt-0.5">{activeSubreddit.description}</p>
              ) : (
                <p className="text-sm text-neutral-500 mt-0.5">{total} discussions</p>
              )}
            </div>
            <Link
              href="/forum/new"
              className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors text-sm"
            >
              New Post
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => { setTag("ALL"); setPage(1); }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
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
                  onClick={() => { setTag(t); setPage(1); }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
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
                onChange={(e) => { setSort(e.target.value as SortMode); setPage(1); }}
                className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs focus:outline-none"
              >
                <option value="new">Newest</option>
                <option value="top">Top Voted</option>
              </select>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search..."
                className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 w-36"
              />
              {subredditId && (
                <button
                  onClick={() => { setSubredditId(""); setPage(1); }}
                  className="text-xs text-primary hover:underline"
                >
                  All communities
                </button>
              )}
            </div>
          </div>

          {/* Posts */}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-3 opacity-40">💬</div>
              <p className="text-neutral-500 font-medium">No posts yet</p>
              <p className="text-sm text-neutral-400 mt-1">Be the first to start a discussion!</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {posts.map((post) => {
                const tagColor = FORUM_TAG_COLORS[post.tag] ?? "bg-neutral-100 text-neutral-600";
                return (
                  <div
                    key={post.id}
                    className="flex gap-3 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-primary/30 transition-colors"
                  >
                    {/* Vote column */}
                    <div className="flex flex-col items-center gap-0 shrink-0 w-8">
                      <button
                        onClick={() => handleVote(post.id, 1)}
                        className={`p-0.5 rounded transition-colors ${
                          post.userVote === 1 ? "text-primary" : "text-neutral-300 dark:text-neutral-600 hover:text-primary"
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <span className={`text-xs font-bold ${
                        post.voteScore > 0 ? "text-primary" : post.voteScore < 0 ? "text-red-500" : "text-neutral-400"
                      }`}>
                        {post.voteScore}
                      </span>
                      <button
                        onClick={() => handleVote(post.id, -1)}
                        className={`p-0.5 rounded transition-colors ${
                          post.userVote === -1 ? "text-red-500" : "text-neutral-300 dark:text-neutral-600 hover:text-red-500"
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5 text-xs text-neutral-400">
                        {post.subreddit && (
                          <>
                            <button
                              onClick={() => { setSubredditId(post.subreddit!.id); setPage(1); }}
                              className="font-medium text-neutral-600 dark:text-neutral-300 hover:text-primary transition-colors"
                            >
                              s/{post.subreddit.name}
                            </button>
                            <span>&middot;</span>
                          </>
                        )}
                        <span>{post.author.name}</span>
                        <span>&middot;</span>
                        <span>{timeAgo(post.createdAt)}</span>
                        <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${tagColor}`}>
                          {post.tag}
                        </span>
                      </div>
                      <Link
                        href={`/forum/${post.id}`}
                        className="font-medium text-sm hover:text-primary transition-colors block leading-snug"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{post.content}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-400">
                        <span className="inline-flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {post._count.comments} comments
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <span className="text-xs text-neutral-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let p: number;
                  if (totalPages <= 5) {
                    p = i + 1;
                  } else if (page <= 3) {
                    p = i + 1;
                  } else if (page >= totalPages - 2) {
                    p = totalPages - 4 + i;
                  } else {
                    p = page - 2 + i;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                        p === page
                          ? "bg-primary text-white border-primary"
                          : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2.5 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-20 space-y-4">
            {/* Communities */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <h3 className="text-sm font-semibold">Communities</h3>
              </div>
              <div className="p-2">
                <button
                  onClick={() => { setSubredditId(""); setPage(1); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !subredditId
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  🏠 All Posts
                </button>
                {subreddits.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-neutral-400">No communities yet</p>
                ) : (
                  subreddits.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => { setSubredditId(sub.id); setPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        subredditId === sub.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: sub.color }}
                      />
                      <span className="truncate">s/{sub.name}</span>
                      <span className="ml-auto text-xs text-neutral-400">{sub._count.posts}</span>
                    </button>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-neutral-200 dark:border-neutral-800">
                <Link
                  href="/forum/communities"
                  className="block text-center text-xs text-primary hover:underline py-1"
                >
                  Create Community
                </Link>
              </div>
            </div>

            {/* Forum Stats */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
              <h3 className="text-sm font-semibold mb-3">Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Posts</span>
                  <span className="font-medium">{total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Communities</span>
                  <span className="font-medium">{subreddits.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
