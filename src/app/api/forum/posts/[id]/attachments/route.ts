import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeAttachments } from "@/lib/forum-attachments";

const MAX_ATTACHMENTS = 10;

interface AttachmentsBody {
  urls: string[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.forumPost.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (post.authorId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: AttachmentsBody = await request.json();
  const urls = body.urls?.filter((u) => typeof u === "string" && u.trim()) ?? [];

  if (urls.length === 0) {
    return NextResponse.json({ error: "No image URLs provided" }, { status: 400 });
  }

  const existing = await prisma.forumPostAttachment.count({ where: { postId: id } });
  if (existing + urls.length > MAX_ATTACHMENTS) {
    return NextResponse.json(
      { error: `Posts can have at most ${MAX_ATTACHMENTS} images` },
      { status: 400 },
    );
  }

  const created = await prisma.$transaction(
    urls.map((url, index) =>
      prisma.forumPostAttachment.create({
        data: {
          postId: id,
          url: url.trim(),
          sortOrder: existing + index,
        },
        select: { id: true, url: true, sortOrder: true },
      }),
    ),
  );

  return NextResponse.json(serializeAttachments(created), { status: 201 });
}
