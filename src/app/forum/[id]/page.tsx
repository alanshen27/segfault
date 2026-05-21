"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import CommunityIcon from "@/components/CommunityIcon";
import TagBadge from "@/components/TagBadge";
import ForumVoteRail from "@/components/forum/ForumVoteRail";
import ForumThread from "@/components/forum/ForumThread";
import ForumSuggestedPosts from "@/components/forum/ForumSuggestedPosts";
import PostAttachmentGallery from "@/components/forum/PostAttachmentGallery";
import PostCommunitySidebar from "@/components/forum/PostCommunitySidebar";
import { timeAgo } from "@/lib/forum-utils";
import {
  type ForumPostDetail,
  type ForumPostSummary,
  type PaginatedResponse,
  type SubredditSummary,
} from "@/lib/types";

export default function ForumPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<ForumPostDetail | null>(null);
  const [community, setCommunity] = useState<SubredditSummary | null>(null);
  const [suggested, setSuggested] = useState<ForumPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/forum/posts/${postId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json() as Promise<ForumPostDetail>;
      })
      .then(async (data) => {
        if (!active) return;
        setPost(data);
        setLoading(false);

        const suggestedParams = new URLSearchParams({
          sort: "top",
          pageSize: "8",
        });
        if (data.subreddit?.id) {
          suggestedParams.set("subredditId", data.subreddit.id);
        }

        const fetches: Promise<void>[] = [
          fetch(`/api/forum/posts?${suggestedParams.toString()}`)
            .then((r) => r.json() as Promise<PaginatedResponse<ForumPostSummary>>)
            .then((res) => {
              if (active) {
                setSuggested(res.data.filter((p) => p.id !== data.id).slice(0, 5));
              }
            }),
        ];

        if (data.subreddit?.slug) {
          fetches.push(
            fetch(`/api/subreddits/${data.subreddit.slug}`)
              .then((r) => (r.ok ? r.json() : null))
              .then((sub: SubredditSummary | null) => {
                if (active && sub) setCommunity(sub);
              }),
          );
        }

        await Promise.all(fetches);
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

  const handleReply = async (content: string, parentId: string | null) => {
    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/forum/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setPost((prev) =>
          prev
            ? {
                ...prev,
                comments: [...prev.comments, newComment],
                _count: { ...prev._count, comments: prev._count.comments + 1 },
              }
            : prev,
        );
      }
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/forum/posts/${postId}`, { method: "DELETE" });
    if (res.ok) router.push("/forum");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
          <div className="h-6 w-32 bg-neutral-900 rounded animate-pulse" />
          <div className="h-72 rounded-xl bg-neutral-900 animate-pulse" />
          <div className="h-96 rounded-xl bg-neutral-900 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-neutral-500">Post not found.</p>
        <Link href="/forum" className="text-primary text-sm mt-2 inline-block hover:underline">
          Back to Forum
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <Link
          href={post.subreddit ? `/forum/communities/${post.subreddit.slug}` : "/forum"}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {post.subreddit ? `Back to s/${post.subreddit.name}` : "Back to Forum"}
        </Link>

        <div className="flex gap-6 lg:gap-8">
          <div className="flex-1 min-w-0">
            <article className="mb-6 overflow-hidden">
              <div className="p-5 sm:p-6 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {post.subreddit && (
                    <Link
                      href={`/forum/communities/${post.subreddit.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-white hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: post.subreddit.color }}
                    >
                      <CommunityIcon
                        name={post.subreddit.name}
                        iconUrl={post.subreddit.iconUrl}
                        color={post.subreddit.color}
                        size="sm"
                        className="!w-4 !h-4 !text-[8px] ring-0"
                      />
                      s/{post.subreddit.name}
                    </Link>
                  )}
                  <TagBadge tag={post.tag} size="md" />
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <ForumVoteRail
                    size="md"
                    plain
                    orientation="horizontal"
                    score={post.voteScore}
                    userVote={post.userVote}
                    onVote={handleVote}
                  />
                  <h1 className="flex-1 min-w-0 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-neutral-50 pt-0.5">
                    {post.title}
                  </h1>
                </div>

                <div className="flex items-center gap-3 pb-4 mb-4">
                  <Avatar src={post.author.avatarUrl} name={post.author.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-200">u/{post.author.name}</p>
                    <p className="text-xs text-neutral-500">{timeAgo(post.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <div className="text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap text-neutral-300 max-w-none">
                  {post.content}
                </div>

                <PostAttachmentGallery attachments={post.attachments ?? []} />
              </div>
            </article>

            <div className="p-5 sm:p-6">
              <ForumThread
                comments={post.comments}
                onSubmitReply={handleReply}
                submitting={submittingReply}
              />
            </div>

            <ForumSuggestedPosts
              posts={suggested}
              communityName={post.subreddit?.name}
            />
          </div>

          {community && (
            <aside className="hidden lg:block w-72 shrink-0">
              <PostCommunitySidebar community={community} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
