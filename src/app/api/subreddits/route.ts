import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireModerator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface SubredditCreateBody {
  name: string;
  description: string;
  color?: string;
}

export async function GET() {
  const subreddits = await prisma.subreddit.findMany({
    include: {
      _count: { select: { posts: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { posts: { _count: "desc" } },
  });

  return NextResponse.json(
    subreddits.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      color: s.color,
      _count: s._count,
      createdBy: s.createdBy,
    })),
  );
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await requireModerator();

  const body: SubredditCreateBody = await request.json();
  const { name, description, color } = body;

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
      createdById: user.id,
    },
    include: {
      _count: { select: { posts: true } },
      createdBy: { select: { name: true } },
    },
  });

  return NextResponse.json(subreddit, { status: 201 });
}
