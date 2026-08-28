"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import ForumPostCard from "@/components/forum/ForumPostCard";
import ForumSidebar from "@/components/forum/ForumSidebar";
import {
  ForumHero,
  ForumPageShell,
  ListSkeleton,
  PageContainer,
  PaginationBar,
} from "@/components/layout";
import TagPicker from "@/components/TagPicker";
import { useCurrentUser } from "@/lib/use-current-user";
import {
  type ForumPostSummary,
  type ForumTagSummary,
  type SubredditSummary,
  type PaginatedResponse,
} from "@/lib/types";

type TagFilter = string | "ALL";
type SortMode = "new" | "top";

export default function ForumPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useCurrentUser();
  const [posts, setPosts] = useState<ForumPostSummary[]>([]);
  const [subreddits, setSubreddits] = useState<SubredditSummary[]>([]);
  const [tags, setTags] = useState<ForumTagSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState<TagFilter>("ALL");
  const [sort, setSort] = useState<SortMode>("new");
  const [search, setSearch] = useState("");
  const [subredditId, setSubredditId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showTagCreate, setShowTagCreate] = useState(false);

  const reloadTags = () => {
    const url = subredditId
      ? `/api/forum/tags?subredditId=${subredditId}`
      : "/api/forum/tags";
    return fetch(url)
      .then((r) => r.json() as Promise<ForumTagSummary[]>)
      .then((data) => { if (Array.isArray(data)) setTags(data); });
  };

  useEffect(() => {
    const fromUrl = searchParams.get("subredditId");
    if (fromUrl) setSubredditId(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    setTag("ALL");
    setPage(1);
    setShowTagCreate(false);
  }, [subredditId]);

  useEffect(() => {
    let active = true;
    fetch("/api/subreddits")
      .then((r) => r.json() as Promise<SubredditSummary[]>)
      .then((subs) => { if (active) setSubreddits(subs); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const url = subredditId
      ? `/api/forum/tags?subredditId=${subredditId}`
      : "/api/forum/tags";
    fetch(url)
      .then((r) => r.json())
      .then((data: ForumTagSummary[] | { error: string }) => {
        if (active && Array.isArray(data)) setTags(data);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [subredditId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams();
    if (tag !== "ALL") {
      if (subredditId) params.set("tag", tag);
      else params.set("tagId", tag);
    }
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
    if (res.status === 401) {
      router.push("/login");
      return;
    }
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
  const newPostHref = activeSubreddit
    ? `/forum/new?subredditId=${activeSubreddit.id}`
    : "/forum/new";

  return (
    <ForumPageShell>
      <ForumHero
        eyebrow="💬 # forum"
        title={activeSubreddit ? <>s/{activeSubreddit.name}</> : <>forum</>}
        description={
          activeSubreddit
            ? activeSubreddit.description
            : "table talk — discuss problems, share editorials, and swap notes with other builders."
        }
        actions={
          <>
            <Link
              href="/forum/communities"
              className="px-4 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:bg-primary-light dark:hover:bg-neutral-900 transition-colors"
            >
              Communities
            </Link>
            {user ? (
              <Link
                href={newPostHref}
                className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm"
              >
                New Post
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm"
              >
                Sign in to Post
              </Link>
            )}
          </>
        }
      />

      <PageContainer width="wide" className="py-6">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0 space-y-4">
            {/* Toolbar */}
            <div className="rounded-xl border border-primary-200/70 dark:border-neutral-800 bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-1 p-1.5 border-b border-primary-200/70 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/50">
                {(["new", "top"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { setSort(mode); setPage(1); }}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      sort === mode
                        ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                        : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                    }`}
                  >
                    {mode === "new" ? "New" : "Top"}
                  </button>
                ))}
                <div className="flex-1 hidden sm:block" />
                <div className="relative flex-1 sm:max-w-xs">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search discussions..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="p-3 flex items-center gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => { setTag("ALL"); setPage(1); }}
                  className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                    tag === "ALL"
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  All
                </button>
                {tags.map((t) => {
                  const tagKey = subredditId ? t.slug : t.id;
                  return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setTag(tagKey!); setPage(1); }}
                    className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                      tag === tagKey ? "ring-2 ring-primary ring-offset-1" : ""
                    } ${t.color}`}
                  >
                    {t.name}
                    {!subredditId && t.subreddit && (
                      <span className="opacity-60 font-normal ml-1">· s/{t.subreddit.name}</span>
                    )}
                  </button>
                  );
                })}
                {subredditId && user && (
                  <button
                    type="button"
                    onClick={() => setShowTagCreate((s) => !s)}
                    className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full border border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 hover:border-primary hover:text-primary transition-colors"
                  >
                    + Tag
                  </button>
                )}
                {subredditId && (
                  <button
                    type="button"
                    onClick={() => { setSubredditId(""); setPage(1); }}
                    className="shrink-0 ml-auto text-xs text-primary font-medium hover:underline"
                  >
                    Clear community filter
                  </button>
                )}
              </div>

              {showTagCreate && subredditId && user && (
                <div className="px-4 pb-4 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                  <TagPicker
                    subredditId={subredditId}
                    value={tag === "ALL" ? "GENERAL" : tag}
                    onChange={(slug) => {
                      setTag(slug);
                      reloadTags();
                      setShowTagCreate(false);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Feed */}
            {loading ? (
              <ListSkeleton
                count={4}
                className="h-32 rounded-xl bg-neutral-200/60 dark:bg-neutral-900 animate-pulse"
              />
            ) : posts.length === 0 ? (
              <EmptyState
                title="No posts yet"
                description={
                  activeSubreddit
                    ? `No discussions in s/${activeSubreddit.name} yet.`
                    : "Be the first to start a discussion!"
                }
                actionLabel={user ? "New Post" : "Sign in to Post"}
                actionHref={user ? newPostHref : "/login"}
              />
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <ForumPostCard key={post.id} post={post} onVote={handleVote} />
                ))}
              </div>
            )}

            <PaginationBar
              page={page}
              totalPages={totalPages}
              total={total}
              itemLabel="posts"
              onPageChange={setPage}
            />
          </div>

          <aside className="hidden lg:block w-72 shrink-0">
            <ForumSidebar
              subreddits={subreddits}
              subredditId={subredditId}
              totalPosts={total}
              tagCount={tags.length}
              onSelectAll={() => { setSubredditId(""); setPage(1); }}
            />
          </aside>
        </div>
      </PageContainer>
    </ForumPageShell>
  );
}
