import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface VoteBody {
  value: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body: VoteBody = await request.json();
  const value = body.value === 1 ? 1 : -1;

  const existing = await prisma.projectVote.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });

  if (existing) {
    if (existing.value === value) {
      await prisma.projectVote.delete({ where: { id: existing.id } });
      return NextResponse.json({ vote: null });
    }
    const updated = await prisma.projectVote.update({
      where: { id: existing.id },
      data: { value },
    });
    return NextResponse.json({ vote: updated.value });
  }

  const created = await prisma.projectVote.create({
    data: { value, userId: user.id, projectId },
  });

  return NextResponse.json({ vote: created.value }, { status: 201 });
}
