import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  runQuestionTests,
  submissionStatusFromRun,
} from "@/lib/run-question-tests";

interface RunBody {
  code: string;
  language: string;
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
  const body: RunBody = await request.json();
  const { code, language } = body;

  if (!code?.trim()) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }
  if (!language) {
    return NextResponse.json({ error: "Language is required" }, { status: 400 });
  }

  const question = await prisma.question.findUnique({
    where: { id, approved: true },
    include: {
      testCases: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!question) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const runResult = await runQuestionTests(
      {
        sampleInput: question.sampleInput,
        sampleOutput: question.sampleOutput,
        timeLimit: question.timeLimit,
        memoryLimit: question.memoryLimit,
        testCases: question.testCases,
      },
      code,
      language,
    );

    const status = submissionStatusFromRun(runResult);
    const outputSummary = runResult.allPassed
      ? "All tests passed"
      : `${runResult.passedCount}/${runResult.totalCount} tests passed`;

    await prisma.submission.create({
      data: {
        questionId: id,
        userId: user.id,
        code,
        language,
        status,
        output: outputSummary,
      },
    });

    return NextResponse.json({
      ...runResult,
      solved: runResult.allPassed,
      submissionStatus: status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const httpStatus = message.includes("No test cases") ? 400 : 500;
    return NextResponse.json(
      { error: "Execution failed", details: message },
      { status: httpStatus },
    );
  }
}
