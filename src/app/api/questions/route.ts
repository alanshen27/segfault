import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type Prisma } from "@/generated/prisma/client";
import { sortTestCasesByInputLength } from "@/lib/question-test-cases";

interface TestCaseBody {
  input: string;
  output: string;
}

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
  testCases?: TestCaseBody[];
}

const MAX_TEST_CASES = 50;

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
  const sort = url.searchParams.get("sort") ?? "newest";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "20", 10)));

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
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
      { topic: { contains: search, mode: "insensitive" } },
    ];
  }

  type QuestionOrderBy = Prisma.QuestionOrderByWithRelationInput;
  let orderBy: QuestionOrderBy = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };
  else if (sort === "title") orderBy = { title: "asc" };

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: {
        author: { select: { name: true } },
        bank: { select: { id: true, name: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.question.count({ where }),
  ]);

  return NextResponse.json({
    data: questions,
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

  const body: QuestionCreateBody = await request.json();
  const {
    title,
    content,
    difficulty,
    topic,
    constraints,
    sampleInput,
    sampleOutput,
    timeLimit,
    memoryLimit,
    bankId,
    testCases,
  } = body;

  const sortedCases = sortTestCasesByInputLength(
    (testCases ?? []).filter((tc) => tc.input?.trim() && tc.output?.trim()),
  );

  if (sortedCases.length > MAX_TEST_CASES) {
    return NextResponse.json(
      { error: `At most ${MAX_TEST_CASES} test cases allowed` },
      { status: 400 },
    );
  }

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
      approved: user.role === "ADMIN" || user.role === "MODERATOR",
      ...(sortedCases.length > 0 && {
        testCases: {
          create: sortedCases.map((tc, index) => ({
            input: tc.input,
            output: tc.output,
            sortOrder: index,
          })),
        },
      }),
    },
    include: {
      _count: { select: { testCases: true } },
    },
  });

  if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
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
