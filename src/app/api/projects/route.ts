import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tag = searchParams.get("tag");
  const status = searchParams.get("status");
  const role = searchParams.get("lookingFor");

  const where: Record<string, unknown> = {};
  if (tag) where.tags = { has: tag };
  if (status) where.status = status;
  if (role) where.lookingFor = { has: role };

  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      votes: true,
      _count: { select: { comments: true, votes: true } },
    },
  });

  return NextResponse.json(
    projects.map((project) => ({
      id: project.id,
      title: project.title,
      tagline: project.tagline,
      description: project.description,
      githubUrl: project.githubUrl,
      demoUrl: project.demoUrl,
      tags: project.tags,
      status: project.status,
      lookingFor: project.lookingFor,
      author: project.author,
      createdAt: project.createdAt.toISOString(),
      voteScore: project.votes.reduce((sum, v) => sum + v.value, 0),
      _count: project._count,
    })),
  );
}

interface CreateProjectBody {
  title: string;
  tagline: string;
  description?: string;
  githubUrl?: string;
  demoUrl?: string;
  tags: string[];
  status: string;
  lookingFor: string[];
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: CreateProjectBody = await request.json();

  if (!body.title?.trim() || !body.tagline?.trim()) {
    return NextResponse.json(
      { error: "Title and tagline are required" },
      { status: 400 },
    );
  }

  const project = await prisma.project.create({
    data: {
      title: body.title.trim(),
      tagline: body.tagline.trim(),
      description: body.description?.trim() || null,
      githubUrl: body.githubUrl?.trim() || null,
      demoUrl: body.demoUrl?.trim() || null,
      tags: body.tags ?? [],
      status: body.status || "Idea",
      lookingFor: body.lookingFor ?? [],
      authorId: user.id,
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(project, { status: 201 });
}
