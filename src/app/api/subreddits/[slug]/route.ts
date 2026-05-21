import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const subreddit = await prisma.subreddit.findUnique({
    where: { slug },
    include: {
      _count: { select: { posts: true } },
      createdBy: { select: { name: true } },
    },
  });

  if (!subreddit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: subreddit.id,
    name: subreddit.name,
    slug: subreddit.slug,
    description: subreddit.description,
    color: subreddit.color,
    _count: subreddit._count,
    createdBy: subreddit.createdBy,
  });
}
