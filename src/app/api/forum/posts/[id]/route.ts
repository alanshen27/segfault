import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const post = await prisma.forumPost.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      subreddit: { select: { id: true, name: true, slug: true, color: true } },
      _count: { select: { comments: true, votes: true } },
      votes: true,
      comments: {
        include: {
          author: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const voteScore = post.votes.reduce((sum, v) => sum + v.value, 0);
  const userVote = currentUser
    ? post.votes.find((v) => v.userId === currentUser.id)?.value ?? null
    : null;

  return NextResponse.json({
    id: post.id,
    title: post.title,
    content: post.content,
    tag: post.tag,
    createdAt: post.createdAt.toISOString(),
    author: post.author,
    subreddit: post.subreddit,
    _count: post._count,
    voteScore,
    userVote,
    comments: post.comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      author: c.author,
      parentId: c.parentId,
    })),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.forumPost.findUnique({ where: { id } });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (post.authorId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.forumPost.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
