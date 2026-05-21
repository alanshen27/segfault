"use client";

import Link from "next/link";
import CommunityIcon from "@/components/CommunityIcon";
import TagBadge from "@/components/TagBadge";
import { timeAgo } from "@/lib/forum-utils";
import { type ForumPostSummary } from "@/lib/types";

interface ForumSuggestedPostsProps {
  posts: ForumPostSummary[];
  communityName?: string;
}

export default function ForumSuggestedPosts({ posts, communityName }: ForumSuggestedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-8 pt-8">
      <h2 className="text-base font-semibold text-neutral-100 mb-4">
        {communityName ? `More from s/${communityName}` : "Suggested posts"}
      </h2>
      <div className="overflow-hidden divide-y divide-neutral-800/60">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/forum/${post.id}`}
            className="flex items-start gap-4 px-4 py-3 hover:bg-neutral-900/60 transition-colors group"
          >
            <div className="shrink-0 w-10 text-center pt-0.5">
              <span className="block text-sm font-bold text-neutral-300 tabular-nums">
                {post.voteScore}
              </span>
              <span className="block text-[10px] text-neutral-500 uppercase tracking-wide">
                pts
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500 mb-1">
                {post.subreddit && (
                  <>
                    <span className="inline-flex items-center gap-1 font-semibold text-neutral-400">
                      <CommunityIcon
                        name={post.subreddit.name}
                        iconUrl={post.subreddit.iconUrl}
                        color={post.subreddit.color}
                        size="sm"
                        className="!w-4 !h-4 !text-[8px] ring-0"
                      />
                      s/{post.subreddit.name}
                    </span>
                    <span>·</span>
                  </>
                )}
                <span>u/{post.author.name}</span>
                <span>·</span>
                <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
                <TagBadge tag={post.tag} />
              </div>
              <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                {post._count.comments} {post._count.comments === 1 ? "reply" : "replies"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
