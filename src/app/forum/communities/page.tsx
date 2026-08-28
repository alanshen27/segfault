"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import CommunityIcon from "@/components/CommunityIcon";
import Avatar from "@/components/Avatar";
import ImageUpload from "@/components/ImageUpload";
import { uploadCommunityIcon } from "@/lib/storage";
import { type SubredditSummary, type UserProfile } from "@/lib/types";

type SortMode = "popular" | "new";

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function CommunitiesPage() {
  const [subreddits, setSubreddits] = useState<SubredditSummary[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>("popular");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#D35959");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`/api/subreddits?sort=${sort}`).then((r) => r.json()),
      fetch("/api/me").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([subs, me]: [SubredditSummary[], UserProfile | null]) => {
        if (active) {
          setSubreddits(subs);
          setUser(me);
          setLoading(false);
        }
      })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [sort]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subreddits;
    return subreddits.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    );
  }, [subreddits, search]);

  const canCreate = !!user;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      let iconUrl: string | null = null;
      const slug = slugify(name);
      if (iconFile) {
        iconUrl = await uploadCommunityIcon(slug, iconFile);
      }

      const res = await fetch("/api/subreddits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, color, iconUrl }),
      });

      if (!res.ok) {
        const data: { error?: string } = await res.json();
        throw new Error(data.error ?? "Failed to create community");
      }

      const created: SubredditSummary = await res.json();
      setShowCreate(false);
      setName("");
      setDescription("");
      setColor("#D35959");
      setIconFile(null);
      setSubreddits((prev) => [created, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create community");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="h-10 w-48 bg-primary-50 dark:bg-neutral-900 rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-primary-50 dark:bg-neutral-900 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Main column */}
        <div className="flex-1 min-w-0">
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1 text-sm text-neutral-500">
              <Link href="/forum" className="hover:text-primary transition-colors">Forum</Link>
              <span className="text-neutral-300">/</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">Communities</span>
            </div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">Explore Communities</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Discover places to talk about competitive programming topics
            </p>
          </div>

          {/* Search + sort bar — Reddit-style */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search communities"
                className="w-full pl-9 pr-3 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="flex rounded-full border border-neutral-300 dark:border-neutral-700 overflow-hidden shrink-0">
              {(["popular", "new"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSort(mode)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    sort === mode
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                      : "bg-card text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  }`}
                >
                  {mode === "popular" ? "Popular" : "New"}
                </button>
              ))}
            </div>
          </div>

          {/* Create form modal-style panel */}
          {showCreate && (
            <div className="mb-4 p-5 rounded-lg border border-primary-200/70 dark:border-neutral-800 bg-card shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Create a community</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-2 rounded-lg">
                    {error}
                  </div>
                )}
                <ImageUpload
                  label="Community icon"
                  onFileSelect={setIconFile}
                  disabled={creating}
                  fallback={
                    <CommunityIcon name={name || "?"} color={color} size="xl" />
                  }
                />
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <div className="flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700 overflow-hidden focus-within:ring-2 focus-within:ring-primary/40">
                    <span className="px-3 py-2 text-sm text-neutral-400 bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-300 dark:border-neutral-700">
                      s/
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="flex-1 px-3 py-2 bg-card text-sm focus:outline-none"
                      placeholder="algorithms"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="What is your community about?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fallback color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded border border-neutral-300 cursor-pointer"
                    />
                    <span className="text-xs text-neutral-500">Used when no icon is uploaded</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors"
                  >
                    {creating ? "Creating..." : "Create Community"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCreate(false); setError(""); setIconFile(null); }}
                    className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Community list — Reddit row layout */}
          {filtered.length === 0 ? (
            <EmptyState
              title={search ? "No communities match your search" : "No communities yet"}
              description={
                search
                  ? "Try a different search term."
                  : user
                    ? "Create the first community and start a discussion around a topic you care about."
                    : "Sign in to create the first community."
              }
              actionLabel={search ? undefined : user ? "Create Community" : "Sign in"}
              actionHref={search ? undefined : user ? undefined : "/login"}
              onAction={!search && user ? () => setShowCreate(true) : undefined}
            />
          ) : (
            <div className="rounded-lg border border-primary-200/70 dark:border-neutral-800 bg-card divide-y divide-neutral-200 dark:divide-neutral-800 overflow-hidden">
              {filtered.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                >
                  <Link href={`/forum/communities/${sub.slug}`} className="shrink-0">
                    <CommunityIcon
                      name={sub.name}
                      iconUrl={sub.iconUrl}
                      color={sub.color}
                      size="lg"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/forum/communities/${sub.slug}`}
                      className="font-semibold text-sm hover:underline"
                    >
                      s/{sub.name}
                    </Link>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-500">
                      <span>{sub._count.posts} post{sub._count.posts !== 1 ? "s" : ""}</span>
                      <span className="text-neutral-300 dark:text-neutral-700">&middot;</span>
                      <span className="flex items-center gap-1">
                        <Avatar src={sub.createdBy.avatarUrl} name={sub.createdBy.name} size="xs" />
                        u/{sub.createdBy.name}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                      {sub.description}
                    </p>
                  </div>

                  <Link
                    href={`/forum/communities/${sub.slug}`}
                    className="shrink-0 px-4 py-1.5 rounded-full border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar — Reddit-style cards */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-lg border border-primary-200/70 dark:border-neutral-800 bg-card overflow-hidden">
              <div className="h-10 bg-linear-to-r from-primary to-primary-hover" />
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-1">Create your own community</h3>
                <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
                  Your own community is a place where you and others can talk about competitive programming topics.
                </p>
                {canCreate ? (
                  <button
                    onClick={() => setShowCreate(true)}
                    className="w-full py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
                  >
                    Create Community
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="block w-full py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors text-center"
                  >
                    Sign in to Create
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-primary-200/70 dark:border-neutral-800 bg-card p-4">
              <h3 className="font-semibold text-sm mb-3">Overview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Communities</span>
                  <span className="font-medium">{subreddits.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total posts</span>
                  <span className="font-medium">
                    {subreddits.reduce((n, s) => n + s._count.posts, 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-primary-200/70 dark:border-neutral-800 bg-card p-4 text-xs text-neutral-500 leading-relaxed">
              Community icons are stored in Supabase Storage. Run <code className="text-neutral-700 dark:text-neutral-300">supabase/storage.sql</code> in your Supabase SQL editor if uploads fail.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
