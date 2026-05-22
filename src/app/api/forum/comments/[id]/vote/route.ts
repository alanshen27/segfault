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

  const { id: commentId } = await params;
  const comment = await prisma.forumComment.findUnique({ where: { id: commentId } });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const body: VoteBody = await request.json();
  const value = body.value === 1 ? 1 : -1;

  const existing = await prisma.forumCommentVote.findUnique({
    where: { userId_commentId: { userId: user.id, commentId } },
  });

  if (existing) {
    if (existing.value === value) {
      await prisma.forumCommentVote.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ vote: null });
    }
    const updated = await prisma.forumCommentVote.update({
      where: { id: existing.id },
      data: { value },
    });
    return NextResponse.json({ vote: updated.value });
  }

  const created = await prisma.forumCommentVote.create({
    data: { value, userId: user.id, commentId },
  });

  return NextResponse.json({ vote: created.value }, { status: 201 });
}
