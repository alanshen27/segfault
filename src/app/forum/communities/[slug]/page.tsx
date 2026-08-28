"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import Avatar from "@/components/Avatar";
import ForumPostCard from "@/components/forum/ForumPostCard";
import {
  CommunityHeader,
  ForumPageShell,
  PageContainer,
} from "@/components/layout";
import {
  type ForumPostSummary,
  type SubredditSummary,
  type UserProfile,
  type PaginatedResponse,
} from "@/lib/types";

function canManageCommunity(
  user: UserProfile,
  community: SubredditSummary,
) {
  return (
    community.createdById === user.id
    || user.role === "ADMIN"
    || user.role === "MODERATOR"
  );
}

export default function CommunityPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [community, setCommunity] = useState<SubredditSummary | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<ForumPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);

    Promise.all([
      fetch(`/api/subreddits/${slug}`).then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json() as Promise<SubredditSummary>;
      }),
      fetch("/api/me").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([data, me]: [SubredditSummary | null, UserProfile | null]) => {
        if (!active) return;
        if (!data) {
          setLoading(false);
          return;
        }
        setCommunity(data);
        setUser(me);

        const params = new URLSearchParams({
          subredditId: data.id,
          pageSize: "20",
        });
        return fetch(`/api/forum/posts?${params.toString()}`)
          .then((r) => r.json() as Promise<PaginatedResponse<ForumPostSummary>>)
          .then((res) => {
            if (active) {
              setPosts(res.data);
              setLoading(false);
            }
          });
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [slug]);

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

  if (loading) {
    return (
      <ForumPageShell>
        <PageContainer width="community">
          <div className="relative h-32 sm:h-40 mb-12 sm:mb-3">
            <div className="absolute inset-0 rounded-b-2xl bg-neutral-200/60 dark:bg-neutral-900 animate-pulse" />
            <div className="absolute left-0 bottom-0 z-20 translate-y-1/2 w-20 h-20 rounded-full bg-neutral-200/60 dark:bg-neutral-900 animate-pulse ring-4 ring-neutral-50 dark:ring-neutral-950" />
          </div>
          <div className="space-y-3 sm:pl-24">
            <div className="space-y-2">
              <div className="h-7 w-40 rounded bg-neutral-200/60 dark:bg-neutral-900 animate-pulse" />
              <div className="h-4 w-64 rounded bg-neutral-200/60 dark:bg-neutral-900 animate-pulse" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-neutral-200/60 dark:bg-neutral-900 animate-pulse" />
            ))}
          </div>
        </PageContainer>
      </ForumPageShell>
    );
  }

  if (notFound || !community) {
    return (
      <ForumPageShell>
        <PageContainer width="community" className="py-8">
          <EmptyState
            title="Community not found"
            description="This community doesn't exist or may have been removed."
            actionLabel="Browse communities"
            actionHref="/forum/communities"
          />
        </PageContainer>
      </ForumPageShell>
    );
  }

  const canManage = user ? canManageCommunity(user, community) : false;
  const createPostHref = user
    ? `/forum/new?subredditId=${community.id}`
    : "/login";

  return (
    <ForumPageShell>
      <PageContainer width="community" className="pb-8">
        <CommunityHeader
          name={community.name}
          description={community.description}
          color={community.color}
          iconUrl={community.iconUrl}
          bannerUrl={community.bannerUrl}
          actions={
            <>
              {canManage && (
                <Link
                  href={`/forum/communities/${community.slug}/settings`}
                  className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium bg-card hover:bg-primary-light dark:hover:bg-neutral-900 transition-colors"
                >
                  Settings
                </Link>
              )}
              <Link
                href={createPostHref}
                className="px-5 py-2 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition-colors text-sm text-center shadow-sm"
              >
                {user ? "Create Post" : "Sign in to Post"}
              </Link>
            </>
          }
        />

        <div className="flex items-center gap-4 mb-6 p-4 rounded-lg border border-primary-200/70 dark:border-neutral-800 bg-card text-sm">
          <div>
            <span className="font-bold">{community._count.posts}</span>
            <span className="text-neutral-500 ml-1">Posts</span>
          </div>
          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800" />
          <div className="flex items-center gap-2 text-neutral-500">
            <span>Created by</span>
            <Avatar src={community.createdBy.avatarUrl} name={community.createdBy.name} size="xs" />
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              u/{community.createdBy.name}
            </span>
          </div>
        </div>

        {posts.length === 0 ? (
          <EmptyState
            title="No posts in this community yet"
            description={`Be the first to share something with s/${community.name}.`}
            actionLabel={user ? "Create first post" : "Sign in to Post"}
            actionHref={createPostHref}
          />
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <ForumPostCard key={post.id} post={post} onVote={handleVote} />
            ))}
          </div>
        )}
      </PageContainer>
    </ForumPageShell>
  );
}
