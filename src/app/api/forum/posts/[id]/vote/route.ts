import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface VoteBody {
  value: number; // 1 or -1
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId } = await params;
  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const body: VoteBody = await request.json();
  const value = body.value === 1 ? 1 : -1;

  const existing = await prisma.forumVote.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });

  if (existing) {
    if (existing.value === value) {
      await prisma.forumVote.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ vote: null });
    }
    const updated = await prisma.forumVote.update({
      where: { id: existing.id },
      data: { value },
    });
    return NextResponse.json({ vote: updated.value });
  }

  const created = await prisma.forumVote.create({
    data: { value, userId: user.id, postId },
  });

  return NextResponse.json({ vote: created.value }, { status: 201 });
}
