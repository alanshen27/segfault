import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { questionId, code, language } = body;

  const submission = await prisma.submission.create({
    data: {
      questionId,
      code,
      language,
      status: "PENDING",
      userId: user.id,
    },
  });

  return NextResponse.json(submission, { status: 201 });
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const questionId = url.searchParams.get("questionId");

  const where: Record<string, unknown> = { userId: user.id };
  if (questionId) where.questionId = questionId;

  const submissions = await prisma.submission.findMany({
    where,
    include: {
      question: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(submissions);
}
