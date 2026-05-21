import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function serializeSubreddit(s: {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconUrl: string | null;
  bannerUrl: string | null;
  color: string;
  createdAt: Date;
  createdById: string;
  _count: { posts: number };
  createdBy: { name: string; avatarUrl: string | null };
}) {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    iconUrl: s.iconUrl,
    bannerUrl: s.bannerUrl,
    color: s.color,
    createdAt: s.createdAt.toISOString(),
    createdById: s.createdById,
    _count: s._count,
    createdBy: s.createdBy,
  };
}

function canManageCommunity(
  user: { id: string; role: string },
  subreddit: { createdById: string },
) {
  return (
    subreddit.createdById === user.id
    || user.role === "ADMIN"
    || user.role === "MODERATOR"
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const subreddit = await prisma.subreddit.findUnique({
    where: { slug },
    include: {
      _count: { select: { posts: true } },
      createdBy: { select: { name: true, avatarUrl: true } },
    },
  });

  if (!subreddit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(serializeSubreddit(subreddit));
}

interface SubredditUpdateBody {
  description?: string;
  color?: string;
  iconUrl?: string | null;
  bannerUrl?: string | null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const subreddit = await prisma.subreddit.findUnique({ where: { slug } });
  if (!subreddit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canManageCommunity(user, subreddit)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: SubredditUpdateBody = await request.json();
  const data: Record<string, unknown> = {};

  if (body.description !== undefined) {
    const description = body.description.trim();
    if (description.length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters" },
        { status: 400 },
      );
    }
    data.description = description;
  }

  if (body.color !== undefined) {
    const color = body.color.trim();
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return NextResponse.json({ error: "Invalid color" }, { status: 400 });
    }
    data.color = color;
  }

  if (body.iconUrl !== undefined) {
    data.iconUrl = body.iconUrl;
  }

  if (body.bannerUrl !== undefined) {
    data.bannerUrl = body.bannerUrl;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  const updated = await prisma.subreddit.update({
    where: { slug },
    data,
    include: {
      _count: { select: { posts: true } },
      createdBy: { select: { name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(serializeSubreddit(updated));
}
