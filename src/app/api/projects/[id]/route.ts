import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  projectAttachmentInclude,
  serializeProjectAttachments,
} from "@/lib/project-attachments";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      attachments: projectAttachmentInclude,
      votes: true,
      _count: { select: { comments: true, votes: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          votes: true,
        },
        orderBy: { createdAt: "asc" },
      },
      buildLogs: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const voteScore = project.votes.reduce((sum, v) => sum + v.value, 0);
  const userVote = currentUser
    ? project.votes.find((v) => v.userId === currentUser.id)?.value ?? null
    : null;

  return NextResponse.json({
    id: project.id,
    title: project.title,
    tagline: project.tagline,
    description: project.description,
    githubUrl: project.githubUrl,
    demoUrl: project.demoUrl,
    tags: project.tags,
    status: project.status,
    lookingFor: project.lookingFor,
    createdAt: project.createdAt.toISOString(),
    author: project.author,
    attachments: serializeProjectAttachments(project.attachments),
    _count: project._count,
    voteScore,
    userVote,
    comments: project.comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      author: c.author,
      parentId: c.parentId,
      voteScore: c.votes.reduce((sum, v) => sum + v.value, 0),
      userVote: currentUser
        ? c.votes.find((v) => v.userId === currentUser.id)?.value ?? null
        : null,
    })),
    buildLogs: project.buildLogs.map((log) => ({
      id: log.id,
      content: log.content,
      createdAt: log.createdAt.toISOString(),
      author: log.author,
    })),
  });
}

interface UpdateProjectBody {
  title?: string;
  tagline?: string;
  description?: string;
  githubUrl?: string;
  demoUrl?: string;
  tags?: string[];
  status?: string;
  lookingFor?: string[];
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
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    project.authorId !== user.id
    && user.role !== "ADMIN"
    && user.role !== "MODERATOR"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: UpdateProjectBody = await request.json();
  const title = body.title?.trim();
  const tagline = body.tagline?.trim();

  if (title !== undefined && !title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (tagline !== undefined && !tagline) {
    return NextResponse.json({ error: "Tagline is required" }, { status: 400 });
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(tagline !== undefined && { tagline }),
      ...(body.description !== undefined && {
        description: body.description.trim() || null,
      }),
      ...(body.githubUrl !== undefined && {
        githubUrl: body.githubUrl.trim() || null,
      }),
      ...(body.demoUrl !== undefined && {
        demoUrl: body.demoUrl.trim() || null,
      }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.lookingFor !== undefined && { lookingFor: body.lookingFor }),
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json({
    id: updated.id,
    title: updated.title,
    tagline: updated.tagline,
    description: updated.description,
    githubUrl: updated.githubUrl,
    demoUrl: updated.demoUrl,
    tags: updated.tags,
    status: updated.status,
    lookingFor: updated.lookingFor,
    author: updated.author,
    createdAt: updated.createdAt.toISOString(),
  });
}
