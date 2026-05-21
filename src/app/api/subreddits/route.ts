import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureDefaultTags } from "@/lib/forum-tags";

interface SubredditCreateBody {
  name: string;
  description: string;
  color?: string;
  iconUrl?: string | null;
}

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

export async function GET(request: NextRequest) {
  const sort = new URL(request.url).searchParams.get("sort") ?? "popular";

  const subreddits = await prisma.subreddit.findMany({
    include: {
      _count: { select: { posts: true } },
      createdBy: { select: { name: true, avatarUrl: true } },
    },
    orderBy:
      sort === "new"
        ? { createdAt: "desc" }
        : { posts: { _count: "desc" } },
  });

  return NextResponse.json(subreddits.map(serializeSubreddit));
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: SubredditCreateBody = await request.json();
  const { name, description, color, iconUrl } = body;

  if (!name?.trim() || !description?.trim()) {
    return NextResponse.json(
      { error: "Name and description are required" },
      { status: 400 },
    );
  }

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const existing = await prisma.subreddit.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "A community with this name already exists" },
      { status: 409 },
    );
  }

  const subreddit = await prisma.subreddit.create({
    data: {
      name: name.trim(),
      slug,
      description: description.trim(),
      color: color ?? "#D35959",
      iconUrl: iconUrl ?? null,
      createdById: user.id,
    },
    include: {
      _count: { select: { posts: true } },
      createdBy: { select: { name: true, avatarUrl: true } },
    },
  });

  await ensureDefaultTags(subreddit.id);

  return NextResponse.json(serializeSubreddit(subreddit), { status: 201 });
}
