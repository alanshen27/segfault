"use client";

import Link from "next/link";
import CommunityIcon from "@/components/CommunityIcon";
import { type SubredditSummary } from "@/lib/types";

interface PostCommunitySidebarProps {
  community: SubredditSummary;
}

export default function PostCommunitySidebar({ community }: PostCommunitySidebarProps) {
  return (
    <div className="sticky top-20 space-y-4">
      <div className="rounded-xl bg-neutral-950 overflow-hidden">
        {community.bannerUrl ? (
          <img
            src={community.bannerUrl}
            alt=""
            className="w-full h-20 object-cover"
          />
        ) : (
          <div
            className="h-20"
            style={{
              background: `linear-gradient(135deg, ${community.color} 0%, ${community.color}99 100%)`,
            }}
          />
        )}
        <div className="p-4 -mt-6 relative">
          <CommunityIcon
            name={community.name}
            iconUrl={community.iconUrl}
            color={community.color}
            size="lg"
            className="ring-4 ring-neutral-950 mb-3"
          />
          <Link
            href={`/forum/communities/${community.slug}`}
            className="text-lg font-bold hover:text-primary transition-colors"
          >
            s/{community.name}
          </Link>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed line-clamp-4">
            {community.description}
          </p>
          <div className="mt-4 pt-4 text-xs text-neutral-500 space-y-2">
            <div className="flex justify-between">
              <span>Members</span>
              <span className="font-semibold text-neutral-300">—</span>
            </div>
            <div className="flex justify-between">
              <span>Posts</span>
              <span className="font-semibold text-neutral-300 tabular-nums">
                {community._count.posts}
              </span>
            </div>
          </div>
          <Link
            href={`/forum/new?subredditId=${community.id}`}
            className="mt-4 block w-full py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors text-center"
          >
            Create Post
          </Link>
        </div>
      </div>
    </div>
  );
}
