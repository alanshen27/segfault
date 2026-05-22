import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      bank: { select: { id: true, name: true } },
      _count: { select: { testCases: true } },
    },
  });

  if (!question) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    !question.approved
    && (!user
      || (question.authorId !== user.id
        && user.role !== "ADMIN"
        && user.role !== "MODERATOR"))
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let solved = false;
  if (user) {
    const accepted = await prisma.submission.findFirst({
      where: {
        questionId: id,
        userId: user.id,
        status: "ACCEPTED",
      },
      select: { id: true },
    });
    solved = !!accepted;
  }

  const { _count, ...rest } = question;
  return NextResponse.json({
    ...rest,
    testCaseCount: _count.testCases,
    solved,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const question = await prisma.question.findUnique({ where: { id } });

  if (!question) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (question.authorId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const updated = await prisma.question.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(updated);
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
  const question = await prisma.question.findUnique({ where: { id } });

  if (!question) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (question.authorId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.question.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
