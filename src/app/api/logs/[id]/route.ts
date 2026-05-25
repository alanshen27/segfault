import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface UpdateLogBody {
  content: string;
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
  const log = await prisma.buildLog.findUnique({ where: { id } });
  if (!log) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (log.authorId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: UpdateLogBody = await request.json();
  if (!body.content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const updated = await prisma.buildLog.update({
    where: { id },
    data: { content: body.content.trim() },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json({
    id: updated.id,
    content: updated.content,
    createdAt: updated.createdAt.toISOString(),
    author: updated.author,
    projectId: updated.projectId,
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
  const log = await prisma.buildLog.findUnique({ where: { id } });
  if (!log) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (log.authorId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.buildLog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
