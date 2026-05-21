import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const question = await prisma.question.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!question) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const canView =
    question.authorId === user.id
    || user.role === "ADMIN"
    || user.role === "MODERATOR";

  if (!canView) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const testCases = await prisma.questionTestCase.findMany({
    where: { questionId: id },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      sortOrder: true,
      input: true,
      output: true,
    },
  });

  return NextResponse.json(
    testCases.map((tc) => ({
      id: tc.id,
      sortOrder: tc.sortOrder,
      inputLength: tc.input.length,
      outputLength: tc.output.length,
      input: tc.input,
      output: tc.output,
    })),
  );
}
