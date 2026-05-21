import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pickTagColor, slugifyTag } from "@/lib/forum-tag-constants";

interface TagCreateBody {
  name: string;
  color?: string;
  subredditId: string;
}

function serializeTag(t: {
  id: string;
  slug: string;
  name: string;
  color: string;
  subredditId: string;
  createdAt: Date;
  createdBy: { name: string } | null;
  _count: { posts: number };
  subreddit: { id: string; name: string; slug: string };
}) {
  return {
    id: t.id,
    slug: t.slug,
    name: t.name,
    color: t.color,
    subredditId: t.subredditId,
    subreddit: t.subreddit,
    createdAt: t.createdAt.toISOString(),
    createdBy: t.createdBy,
    _count: t._count,
  };
}

export async function GET(request: NextRequest) {
  const subredditId = new URL(request.url).searchParams.get("subredditId");

  if (subredditId) {
    const subreddit = await prisma.subreddit.findUnique({ where: { id: subredditId } });
    if (!subreddit) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    const tags = await prisma.forumTag.findMany({
      where: { subredditId },
      include: {
        subreddit: { select: { id: true, name: true, slug: true } },
        _count: { select: { posts: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: [{ posts: { _count: "desc" } }, { name: "asc" }],
    });

    return NextResponse.json(tags.map(serializeTag));
  }

  // Global: return every tag that exists (no auto-seeding)
  const tags = await prisma.forumTag.findMany({
    include: {
      subreddit: { select: { id: true, name: true, slug: true } },
      _count: { select: { posts: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: [{ posts: { _count: "desc" } }, { name: "asc" }],
  });

  return NextResponse.json(tags.map(serializeTag));
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: TagCreateBody = await request.json();
  const name = body.name?.trim();
  const { subredditId } = body;

  if (!subredditId) {
    return NextResponse.json({ error: "subredditId is required" }, { status: 400 });
  }

  const subreddit = await prisma.subreddit.findUnique({ where: { id: subredditId } });
  if (!subreddit) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "Tag name must be at least 2 characters" },
      { status: 400 },
    );
  }

  const slug = slugifyTag(name);
  if (!slug) {
    return NextResponse.json({ error: "Invalid tag name" }, { status: 400 });
  }

  const existing = await prisma.forumTag.findUnique({
    where: { subredditId_slug: { subredditId, slug } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A tag with this name already exists in this community" },
      { status: 409 },
    );
  }

  const tagCount = await prisma.forumTag.count({ where: { subredditId } });
  const tag = await prisma.forumTag.create({
    data: {
      subredditId,
      slug,
      name,
      color: body.color ?? pickTagColor(tagCount),
      createdById: user.id,
    },
    include: {
      subreddit: { select: { id: true, name: true, slug: true } },
      _count: { select: { posts: true } },
      createdBy: { select: { name: true } },
    },
  });

  return NextResponse.json(serializeTag(tag), { status: 201 });
}
