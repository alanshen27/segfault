import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface PostCreateBody {
  title: string;
  content: string;
  tag?: string;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tag = url.searchParams.get("tag");
  const search = url.searchParams.get("search");
  const sort = url.searchParams.get("sort") ?? "new";

  const where: Record<string, unknown> = {};
  if (tag && tag !== "ALL") where.tag = tag;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ];
  }

  const currentUser = await getCurrentUser();

  const posts = await prisma.forumPost.findMany({
    where,
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { comments: true, votes: true } },
      votes: true,
    },
    orderBy: sort === "top"
      ? { votes: { _count: "desc" } }
      : { createdAt: "desc" },
  });

  const result = posts.map((post) => {
    const voteScore = post.votes.reduce((sum, v) => sum + v.value, 0);
    const userVote = currentUser
      ? post.votes.find((v) => v.userId === currentUser.id)?.value ?? null
      : null;
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      tag: post.tag,
      createdAt: post.createdAt.toISOString(),
      author: post.author,
      _count: post._count,
      voteScore,
      userVote,
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: PostCreateBody = await request.json();
  const { title, content, tag } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  const post = await prisma.forumPost.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      tag: tag ?? "GENERAL",
      authorId: user.id,
    },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
