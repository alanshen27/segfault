import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type Prisma } from "@/generated/prisma/client";

interface QuestionCreateBody {
  title: string;
  content: string;
  difficulty: string;
  topic: string;
  constraints?: string | null;
  sampleInput?: string | null;
  sampleOutput?: string | null;
  timeLimit?: number;
  memoryLimit?: number;
  bankId?: string | null;
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const difficulty = url.searchParams.get("difficulty");
  const topic = url.searchParams.get("topic");
  const bankId = url.searchParams.get("bankId");
  const search = url.searchParams.get("search");
  const pending = url.searchParams.get("pending");

  const where: Prisma.QuestionWhereInput = {};

  if (pending === "true") {
    where.approved = false;
  } else {
    where.approved = true;
  }

  if (difficulty) where.difficulty = difficulty.toUpperCase();
  if (topic) where.topic = topic;
  if (bankId) where.bankId = bankId;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ];
  }

  const questions = await prisma.question.findMany({
    where,
    include: {
      author: { select: { name: true } },
      bank: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(questions);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: QuestionCreateBody = await request.json();
  const { title, content, difficulty, topic, constraints, sampleInput, sampleOutput, timeLimit, memoryLimit, bankId } = body;

  const question = await prisma.question.create({
    data: {
      title,
      content,
      difficulty: difficulty.toUpperCase(),
      topic,
      constraints: constraints ?? null,
      sampleInput: sampleInput ?? null,
      sampleOutput: sampleOutput ?? null,
      timeLimit: timeLimit ?? 2000,
      memoryLimit: memoryLimit ?? 256,
      authorId: user.id,
      bankId: bankId || null,
      approved: user.role === "ADMIN",
    },
  });

  if (user.role !== "ADMIN") {
    await prisma.approval.create({
      data: {
        questionId: question.id,
        submittedById: user.id,
        status: "PENDING",
      },
    });
  }

  return NextResponse.json(question, { status: 201 });
}
