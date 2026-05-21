"use client";

import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import CommunityIcon from "@/components/CommunityIcon";
import { type SubredditSummary } from "@/lib/types";

interface ForumSidebarProps {
  subreddits: SubredditSummary[];
  subredditId: string;
  totalPosts: number;
  tagCount: number;
  onSelectAll: () => void;
}

export default function ForumSidebar({
  subreddits,
  subredditId,
  totalPosts,
  tagCount,
  onSelectAll,
}: ForumSidebarProps) {
  return (
    <div className="sticky top-20 space-y-4">
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
        <div className="h-1 bg-linear-to-r from-primary to-primary-hover" />
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-1">Start a discussion</h3>
          <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
            Share solutions, ask questions, or write editorials for the community.
          </p>
          <Link
            href="/forum/new"
            className="block w-full py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors text-center"
          >
            Create Post
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Communities</h3>
          <Link href="/forum/communities" className="text-xs text-primary hover:underline">
            Browse all
          </Link>
        </div>
        <div className="p-2 max-h-64 overflow-y-auto">
          <button
            type="button"
            onClick={onSelectAll}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !subredditId
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            All posts
          </button>
          {subreddits.length === 0 ? (
            <div className="px-2 py-1">
              <EmptyState
                compact
                title="No communities yet"
                actionLabel="Create one"
                actionHref="/forum/communities"
              />
            </div>
          ) : (
            subreddits.slice(0, 8).map((sub) => (
              <Link
                key={sub.id}
                href={`/forum/communities/${sub.slug}`}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  subredditId === sub.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                }`}
              >
                <span className="flex items-center gap-2">
                  <CommunityIcon
                    name={sub.name}
                    iconUrl={sub.iconUrl}
                    color={sub.color}
                    size="sm"
                    className="!w-5 !h-5 !text-[10px] ring-0"
                  />
                  <span className="truncate">s/{sub.name}</span>
                  <span className="ml-auto text-xs text-neutral-400 tabular-nums">
                    {sub._count.posts}
                  </span>
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-3">Forum stats</h3>
        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Posts</dt>
            <dd className="font-semibold tabular-nums">{totalPosts}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Communities</dt>
            <dd className="font-semibold tabular-nums">{subreddits.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Tags</dt>
            <dd className="font-semibold tabular-nums">{tagCount}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
