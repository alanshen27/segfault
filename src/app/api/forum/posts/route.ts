import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveTagForPost } from "@/lib/forum-tags";
import { attachmentInclude, serializeAttachments } from "@/lib/forum-attachments";

interface PostCreateBody {
  title: string;
  content: string;
  tag?: string;
  subredditId?: string | null;
}

function serializeTag(tag: { slug: string; name: string; color: string } | null) {
  if (!tag) return null;
  return { slug: tag.slug, name: tag.name, color: tag.color };
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tagId = url.searchParams.get("tagId");
  const tag = url.searchParams.get("tag");
  const search = url.searchParams.get("search");
  const sort = url.searchParams.get("sort") ?? "new";
  const subredditId = url.searchParams.get("subredditId");
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "20", 10)));

  const where: Record<string, unknown> = {};
  if (subredditId) where.subredditId = subredditId;
  if (tagId) {
    where.tagId = tagId;
  } else if (tag && tag !== "ALL") {
    where.forumTag = subredditId
      ? { slug: tag, subredditId }
      : { slug: tag };
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ];
  }

  const currentUser = await getCurrentUser();

  const [posts, total] = await Promise.all([
    prisma.forumPost.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        subreddit: { select: { id: true, name: true, slug: true, color: true, iconUrl: true } },
        forumTag: { select: { slug: true, name: true, color: true } },
        attachments: attachmentInclude,
        _count: { select: { comments: true, votes: true } },
        votes: true,
      },
      orderBy: sort === "top"
        ? { votes: { _count: "desc" } }
        : { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.forumPost.count({ where }),
  ]);

  const result = posts.map((post) => {
    const voteScore = post.votes.reduce((sum, v) => sum + v.value, 0);
    const userVote = currentUser
      ? post.votes.find((v) => v.userId === currentUser.id)?.value ?? null
      : null;
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      tag: serializeTag(post.forumTag),
      attachments: serializeAttachments(post.attachments),
      createdAt: post.createdAt.toISOString(),
      author: post.author,
      subreddit: post.subreddit,
      _count: post._count,
      voteScore,
      userVote,
    };
  });

  return NextResponse.json({
    data: result,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: PostCreateBody = await request.json();
  const { title, content, tag, subredditId } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  if (tag && !subredditId) {
    return NextResponse.json(
      { error: "Tags can only be used within a community" },
      { status: 400 },
    );
  }

  let tagId: string | null = null;
  if (subredditId) {
    const tagSlug = tag ?? "GENERAL";
    const forumTag = await resolveTagForPost(subredditId, tagSlug);
    if (!forumTag) {
      return NextResponse.json({ error: "Invalid tag for this community" }, { status: 400 });
    }
    tagId = forumTag.id;
  }

  const post = await prisma.forumPost.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      tagId,
      authorId: user.id,
      subredditId: subredditId ?? null,
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      subreddit: { select: { id: true, name: true, slug: true, color: true, iconUrl: true } },
      forumTag: { select: { slug: true, name: true, color: true } },
    },
  });

  return NextResponse.json(
    {
      id: post.id,
      title: post.title,
      content: post.content,
      tag: serializeTag(post.forumTag),
      createdAt: post.createdAt.toISOString(),
      author: post.author,
      subreddit: post.subreddit,
    },
    { status: 201 },
  );
}
