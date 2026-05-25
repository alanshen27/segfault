"use client";

import Link from "next/link";
import Avatar from "@/components/Avatar";
import CommunityIcon from "@/components/CommunityIcon";
import TagBadge from "@/components/TagBadge";
import ForumVoteRail from "@/components/forum/ForumVoteRail";
import { timeAgo } from "@/lib/forum-utils";
import { type ForumPostSummary } from "@/lib/types";

interface ForumPostCardProps {
  post: ForumPostSummary;
  onVote: (postId: string, value: number) => void;
  compact?: boolean;
}

export default function ForumPostCard({ post, onVote, compact = false }: ForumPostCardProps) {
  return (
    <article className="group flex gap-0 rounded-xl bg-transparent hover:bg-neutral-100/80 dark:hover:bg-neutral-900/40 transition-colors overflow-hidden">
      <ForumVoteRail
        plain
        score={post.voteScore}
        userVote={post.userVote}
        onVote={(v) => onVote(post.id, v)}
      />

      <div className={`flex-1 min-w-0 ${compact ? "p-3" : "p-4"}`}>
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-neutral-500 mb-1.5">
          {post.subreddit && (
            <>
              <Link
                href={`/forum/communities/${post.subreddit.slug}`}
                className="inline-flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300 hover:text-primary transition-colors"
              >
                <CommunityIcon
                  name={post.subreddit.name}
                  iconUrl={post.subreddit.iconUrl}
                  color={post.subreddit.color}
                  size="sm"
                  className="!w-5 !h-5 !text-[10px] ring-0"
                />
                s/{post.subreddit.name}
              </Link>
              <span className="text-neutral-300 dark:text-neutral-700">·</span>
            </>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Avatar src={post.author.avatarUrl} name={post.author.name} size="xs" />
            <span className="font-medium text-neutral-600 dark:text-neutral-400">
              u/{post.author.name}
            </span>
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
          <TagBadge tag={post.tag} />
        </div>

        <Link href={`/forum/${post.id}`} className="block">
          <h2 className={`font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary transition-colors leading-snug ${
            compact ? "text-sm" : "text-base sm:text-lg"
          }`}>
            {post.title}
          </h2>
          {!compact && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
              {post.content}
            </p>
          )}
          {post.attachments && post.attachments.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              {post.attachments.slice(0, 3).map((attachment) => (
                <img
                  key={attachment.id}
                  src={attachment.url}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover"
                />
              ))}
              {post.attachments.length > 3 && (
                <span className="text-xs text-neutral-500 font-medium">
                  +{post.attachments.length - 3} more
                </span>
              )}
            </div>
          )}
        </Link>

        <div className="flex items-center gap-4 mt-3">
          <Link
            href={`/forum/${post.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {post._count.comments} {post._count.comments === 1 ? "reply" : "replies"}
          </Link>
        </div>
      </div>
    </article>
  );
}
