import { NextRequest, NextResponse } from "next/server";
import { requireModerator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface ApprovalPatchBody {
  approvalId: string;
  status: string;
  feedback?: string;
}

export async function GET() {
  await requireModerator();

  const approvals = await prisma.approval.findMany({
    where: { status: "PENDING" },
    include: {
      question: {
        include: {
          author: { select: { name: true, email: true } },
        },
      },
      submittedBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(approvals);
}

export async function PATCH(request: NextRequest) {
  const admin = await requireModerator();
  const body: ApprovalPatchBody = await request.json();
  const { approvalId, status, feedback } = body;

  const approval = await prisma.approval.update({
    where: { id: approvalId },
    data: {
      status,
      feedback: feedback || null,
      reviewedById: admin.id,
    },
  });

  if (status === "APPROVED") {
    await prisma.question.update({
      where: { id: approval.questionId },
      data: { approved: true },
    });
  }

  return NextResponse.json(approval);
}
