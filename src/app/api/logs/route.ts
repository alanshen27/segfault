import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.buildLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      project: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json(logs);
}

interface CreateLogBody {
  content: string;
  projectId?: string;
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: CreateLogBody = await request.json();

  if (!body.content?.trim()) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 },
    );
  }

  const log = await prisma.buildLog.create({
    data: {
      content: body.content.trim(),
      authorId: user.id,
      projectId: body.projectId || null,
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      project: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json(log, { status: 201 });
}
