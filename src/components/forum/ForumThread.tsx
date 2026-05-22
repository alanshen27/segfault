"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar from "@/components/Avatar";
import ForumVoteRail from "@/components/forum/ForumVoteRail";
import { timeAgo } from "@/lib/forum-utils";
import { type ForumCommentData } from "@/lib/types";

function buildCommentTree(comments: ForumCommentData[]): ForumCommentData[] {
  const map = new Map<string, ForumCommentData & { replies: ForumCommentData[] }>();
  const roots: ForumCommentData[] = [];

  for (const c of comments) {
    map.set(c.id, { ...c, replies: [] });
  }

  for (const c of comments) {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function countReplies(comment: ForumCommentData): number {
  return (comment.replies ?? []).reduce(
    (sum, reply) => sum + 1 + countReplies(reply),
    0,
  );
}

function ThreadNode({
  comment,
  depth,
  onSubmitReply,
  onVote,
  canReply,
}: {
  comment: ForumCommentData;
  depth: number;
  onSubmitReply: (content: string, parentId: string) => Promise<void>;
  onVote: (commentId: string, value: number) => void;
  canReply: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const replyCount = countReplies(comment);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await onSubmitReply(replyText.trim(), comment.id);
      setReplyText("");
      setShowReply(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="shrink-0 mt-3 w-5 h-5 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 flex items-center justify-center text-xs font-bold transition-colors"
          aria-label={collapsed ? "Expand thread" : "Collapse thread"}
        >
          {collapsed ? "+" : "−"}
        </button>

        <div className="flex-1 min-w-0 pb-3">
          <div className="flex items-start gap-2.5 pt-2">
            <Avatar
              src={comment.author.avatarUrl}
              name={comment.author.name}
              size="sm"
              className="mt-0.5 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                <span className="font-semibold text-neutral-200">
                  u/{comment.author.name}
                </span>
                <span className="text-neutral-500">·</span>
                <time className="text-neutral-500" dateTime={comment.createdAt}>
                  {timeAgo(comment.createdAt)}
                </time>
              </div>

              {!collapsed && (
                <>
                  <p className="mt-1.5 text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <ForumVoteRail
                      size="sm"
                      plain
                      orientation="horizontal"
                      score={comment.voteScore}
                      userVote={comment.userVote}
                      onVote={(value) => onVote(comment.id, value)}
                    />
                    {canReply ? (
                      <button
                        type="button"
                        onClick={() => setShowReply((s) => !s)}
                        className="text-xs font-semibold text-neutral-500 hover:text-neutral-200 transition-colors"
                      >
                        Reply
                      </button>
                    ) : (
                      <Link
                        href="/login"
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Sign in to reply
                      </Link>
                    )}
                    {replyCount > 0 && (
                      <span className="text-xs text-neutral-500">
                        {replyCount} {replyCount === 1 ? "reply" : "replies"}
                      </span>
                    )}
                  </div>

                  {showReply && canReply && (
                    <form onSubmit={handleReply} className="mt-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                        autoFocus
                        placeholder={`Reply to u/${comment.author.name}...`}
                        className="w-full px-3 py-2.5 rounded-lg bg-neutral-900 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => { setShowReply(false); setReplyText(""); }}
                          className="px-4 py-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting || !replyText.trim()}
                          className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary-hover disabled:opacity-50"
                        >
                          {submitting ? "Replying..." : "Reply"}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {collapsed && replyCount > 0 && (
                <button
                  type="button"
                  onClick={() => setCollapsed(false)}
                  className="mt-1 text-xs text-primary hover:underline"
                >
                  Show {replyCount} {replyCount === 1 ? "reply" : "replies"}
                </button>
              )}
            </div>
          </div>

          {!collapsed && comment.replies && comment.replies.length > 0 && (
            <div
              className="mt-1 ml-2 sm:ml-3 pl-3 sm:pl-4 border-l border-neutral-800 space-y-0"
              style={{ marginLeft: depth > 0 ? undefined : "0.25rem" }}
            >
              {comment.replies.map((reply) => (
                <ThreadNode
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  onSubmitReply={onSubmitReply}
                  onVote={onVote}
                  canReply={canReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ForumThreadProps {
  comments: ForumCommentData[];
  onSubmitReply: (content: string, parentId: string | null) => Promise<void>;
  onVoteComment: (commentId: string, value: number) => void;
  submitting: boolean;
  canReply?: boolean;
}

export default function ForumThread({
  comments,
  onSubmitReply,
  onVoteComment,
  submitting,
  canReply = true,
}: ForumThreadProps) {
  const tree = buildCommentTree(comments);
  const [draft, setDraft] = useState("");

  const handleTopLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    await onSubmitReply(draft.trim(), null);
    setDraft("");
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4 pb-3">
        <h2 className="text-base font-semibold text-neutral-100">
          Discussion
          <span className="ml-2 text-sm font-normal text-neutral-500 tabular-nums">
            {comments.length} {comments.length === 1 ? "thread" : "threads"}
          </span>
        </h2>
      </div>

      {canReply ? (
        <form onSubmit={handleTopLevel} className="mb-6">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            placeholder="Share your thoughts..."
            className="w-full px-4 py-3 rounded-xl bg-neutral-900 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !draft.trim()}
              className="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {submitting ? "Posting..." : "Reply to post"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-xl bg-neutral-900 px-4 py-3 text-sm text-neutral-400">
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
          {" "}to join the discussion.
        </div>
      )}

      {tree.length === 0 ? (
        <p className="text-sm text-neutral-500 py-6 text-center">
          No replies yet. Be the first to join the discussion.
        </p>
      ) : (
        <div className="space-y-1">
          {tree.map((c) => (
            <ThreadNode
              key={c.id}
              comment={c}
              depth={0}
              onSubmitReply={onSubmitReply}
              onVote={onVoteComment}
              canReply={canReply}
            />
          ))}
        </div>
      )}
    </section>
  );
}
