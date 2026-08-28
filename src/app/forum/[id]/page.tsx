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
import {
  BackLink,
  ForumPageShell,
  PageContainer,
  PageNotFound,
} from "@/components/layout";
import { timeAgo } from "@/lib/forum-utils";
import { useCurrentUser } from "@/lib/use-current-user";
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
  const { user } = useCurrentUser();

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
    if (res.status === 401) {
      router.push("/login");
      return;
    }
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

  const handleCommentVote = async (commentId: string, value: number) => {
    const res = await fetch(`/api/forum/comments/${commentId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok && post) {
      const data: { vote: number | null } = await res.json();
      setPost({
        ...post,
        comments: post.comments.map((c) => {
          if (c.id !== commentId) return c;
          const oldVote = c.userVote ?? 0;
          const newVote = data.vote ?? 0;
          return {
            ...c,
            voteScore: c.voteScore - oldVote + newVote,
            userVote: data.vote,
          };
        }),
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
      <ForumPageShell>
        <PageContainer width="wide" className="py-8 space-y-4">
          <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-900 rounded animate-pulse" />
          <div className="h-72 rounded-xl bg-neutral-200 dark:bg-neutral-900 animate-pulse" />
          <div className="h-96 rounded-xl bg-neutral-200 dark:bg-neutral-900 animate-pulse" />
        </PageContainer>
      </ForumPageShell>
    );
  }

  if (!post) {
    return (
      <PageNotFound
        width="wide"
        message="Post not found."
        backHref="/forum"
        backLabel="Back to Forum"
      />
    );
  }

  const canDelete = !!user && (
    post.author.id === user.id
    || user.role === "ADMIN"
    || user.role === "MODERATOR"
  );

  return (
    <ForumPageShell>
      <PageContainer width="wide" className="py-6 sm:py-8">
        <BackLink
          href={post.subreddit ? `/forum/communities/${post.subreddit.slug}` : "/forum"}
          className="mb-6"
        >
          {post.subreddit ? `Back to s/${post.subreddit.name}` : "Back to Forum"}
        </BackLink>

        <div className="flex gap-6 lg:gap-8">
          <div className="flex-1 min-w-0">
            <article className="mb-6 overflow-hidden rounded-xl border border-primary-200/70 dark:border-neutral-800 bg-white dark:bg-transparent shadow-sm dark:shadow-none">
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

                <div className="space-y-3 mb-4">
                  <ForumVoteRail
                    size="md"
                    plain
                    orientation="horizontal"
                    score={post.voteScore}
                    userVote={post.userVote}
                    onVote={handleVote}
                  />
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-semibold tracking-tight leading-tight text-neutral-900 dark:text-neutral-50">
                    {post.title}
                  </h1>
                </div>

                <div className="flex items-center gap-3 pb-4 mb-4">
                  <Avatar src={post.author.avatarUrl} name={post.author.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">u/{post.author.name}</p>
                    <p className="text-xs text-neutral-500">{timeAgo(post.createdAt)}</p>
                  </div>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap text-neutral-700 dark:text-neutral-300 max-w-none">
                  {post.content}
                </div>

                <PostAttachmentGallery attachments={post.attachments ?? []} />
              </div>
            </article>

            <div className="p-5 sm:p-6 rounded-xl border border-primary-200/70 dark:border-neutral-800 bg-white dark:bg-transparent shadow-sm dark:shadow-none">
              <ForumThread
                comments={post.comments}
                onSubmitReply={handleReply}
                onVoteComment={handleCommentVote}
                submitting={submittingReply}
                canReply={!!user}
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
      </PageContainer>
    </ForumPageShell>
  );
}
