"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  type ForumPostDetail,
  type ForumCommentData,
  FORUM_TAG_COLORS,
} from "@/lib/types";

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

function buildCommentTree(comments: ForumCommentData[]): ForumCommentData[] {
  const map = new Map<string, ForumCommentData & { replies: ForumCommentData[] }>();
  const roots: ForumCommentData[] = [];

  for (const c of comments) {
    map.set(c.id, { ...c, replies: [] });
  }

  for (const c of comments) {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function CommentNode({
  comment,
  depth,
  onReply,
}: {
  comment: ForumCommentData;
  depth: number;
  onReply: (parentId: string) => void;
}) {
  return (
    <div className={depth > 0 ? "ml-6 border-l-2 border-neutral-200 dark:border-neutral-800 pl-4" : ""}>
      <div className="py-3">
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
          <span className="font-medium text-neutral-600 dark:text-neutral-300">{comment.author.name}</span>
          <span>&middot;</span>
          <span>{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
          {comment.content}
        </p>
        <button
          onClick={() => onReply(comment.id)}
          className="mt-1 text-xs text-neutral-400 hover:text-primary transition-colors"
        >
          Reply
        </button>
      </div>
      {comment.replies && comment.replies.map((reply) => (
        <CommentNode key={reply.id} comment={reply} depth={depth + 1} onReply={onReply} />
      ))}
    </div>
  );
}

export default function ForumPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<ForumPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/forum/posts/${postId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json() as Promise<ForumPostDetail>;
      })
      .then((data) => {
        if (active) {
          setPost(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [postId]);

  const handleVote = async (value: number) => {
    const res = await fetch(`/api/forum/posts/${postId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (res.ok && post) {
      const data: { vote: number | null } = await res.json();
      const oldVote = post.userVote ?? 0;
      const newVote = data.vote ?? 0;
      setPost({
        ...post,
        voteScore: post.voteScore - oldVote + newVote,
        userVote: data.vote,
      });
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingComment(true);

    const res = await fetch(`/api/forum/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: comment,
        parentId: replyTo,
      }),
    });

    if (res.ok) {
      const newComment: ForumCommentData = await res.json();
      setPost((prev) => prev ? { ...prev, comments: [...prev.comments, newComment] } : prev);
      setComment("");
      setReplyTo(null);
    }
    setSubmittingComment(false);
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/forum/posts/${postId}`, { method: "DELETE" });
    if (res.ok) router.push("/forum");
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-4" />
        <div className="h-48 bg-neutral-100 dark:bg-neutral-900 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-neutral-500">Post not found.</p>
        <Link href="/forum" className="text-primary text-sm mt-2 inline-block hover:underline">
          Back to Forum
        </Link>
      </div>
    );
  }

  const tagColor = FORUM_TAG_COLORS[post.tag] ?? "bg-neutral-100 text-neutral-600";
  const commentTree = buildCommentTree(post.comments);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/forum" className="text-sm text-neutral-500 hover:text-primary transition-colors mb-4 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Forum
      </Link>

      <div className="flex gap-4 mt-4">
        <div className="flex flex-col items-center gap-0.5 shrink-0 pt-1">
          <button
            onClick={() => handleVote(1)}
            className={`p-1 rounded transition-colors ${
              post.userVote === 1 ? "text-primary" : "text-neutral-400 hover:text-primary"
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <span className={`text-lg font-bold ${
            post.voteScore > 0 ? "text-primary" : post.voteScore < 0 ? "text-red-500" : "text-neutral-400"
          }`}>
            {post.voteScore}
          </span>
          <button
            onClick={() => handleVote(-1)}
            className={`p-1 rounded transition-colors ${
              post.userVote === -1 ? "text-red-500" : "text-neutral-400 hover:text-red-500"
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {post.subreddit && (
              <Link
                href={`/forum?subredditId=${post.subreddit.id}`}
                className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: post.subreddit.color }}
              >
                s/{post.subreddit.name}
              </Link>
            )}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tagColor}`}>{post.tag}</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
          <div className="flex items-center gap-3 text-sm text-neutral-500 mb-4">
            <span>{post.author.name}</span>
            <span>&middot;</span>
            <span>{timeAgo(post.createdAt)}</span>
            <button onClick={handleDelete} className="text-red-400 hover:text-red-600 text-xs ml-auto transition-colors">
              Delete
            </button>
          </div>
          <div className="prose prose-neutral dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      </div>

      <hr className="my-8 border-neutral-200 dark:border-neutral-800" />

      <div>
        <h2 className="text-lg font-semibold mb-4">
          Comments ({post.comments.length})
        </h2>

        <form onSubmit={handleComment} className="mb-6">
          {replyTo && (
            <div className="text-xs text-neutral-500 mb-2 flex items-center gap-2">
              Replying to a comment
              <button type="button" onClick={() => setReplyTo(null)} className="text-primary hover:underline">
                Cancel
              </button>
            </div>
          )}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm transition-colors"
          />
          <button
            type="submit"
            disabled={submittingComment || !comment.trim()}
            className="mt-2 px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {submittingComment ? "Posting..." : replyTo ? "Reply" : "Comment"}
          </button>
        </form>

        {commentTree.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-8">
            No comments yet. Be the first to chime in!
          </p>
        ) : (
          <div className="space-y-1">
            {commentTree.map((c) => (
              <CommentNode key={c.id} comment={c} depth={0} onReply={setReplyTo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
