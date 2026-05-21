"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import CommunityIcon from "@/components/CommunityIcon";
import Avatar from "@/components/Avatar";
import ForumPostCard from "@/components/forum/ForumPostCard";
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
      <div className="max-w-4xl mx-auto">
        <div className="h-32 bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
        <div className="px-4 py-8 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !community) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyState
          title="Community not found"
          description="This community doesn't exist or may have been removed."
          actionLabel="Browse communities"
          actionHref="/forum/communities"
        />
      </div>
    );
  }

  const canManage = user ? canManageCommunity(user, community) : false;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative z-0 h-24 sm:h-32 overflow-hidden">
        {community.bannerUrl ? (
          <img
            src={community.bannerUrl}
            alt=""
            className="w-full h-full object-cover brightness-75"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${community.color} 0%, ${community.color}99 100%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/40" aria-hidden />
      </div>
      <div className="relative z-10 px-4 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-12 mb-6">
          <CommunityIcon
            name={community.name}
            iconUrl={community.iconUrl}
            color={community.color}
            size="xl"
            className="relative z-10 shrink-0 ring-4 ring-white dark:ring-neutral-950"
          />
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-2xl font-bold tracking-tight">s/{community.name}</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{community.description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canManage && (
              <Link
                href={`/forum/communities/${community.slug}/settings`}
                className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              >
                Settings
              </Link>
            )}
            <Link
              href={`/forum/new?subredditId=${community.id}`}
              className="px-5 py-2 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition-colors text-sm text-center"
            >
              Create Post
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm">
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
            actionLabel="Create first post"
            actionHref={`/forum/new?subredditId=${community.id}`}
          />
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <ForumPostCard key={post.id} post={post} onVote={handleVote} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
