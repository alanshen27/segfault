import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface BankCreateBody {
  name: string;
  description: string;
}

export async function GET() {
  const banks = await prisma.questionBank.findMany({
    include: {
      createdBy: { select: { name: true } },
      _count: { select: { questions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(banks);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: BankCreateBody = await request.json();
  const { name, description } = body;

  const bank = await prisma.questionBank.create({
    data: {
      name,
      description,
      createdById: user.id,
    },
  });

  return NextResponse.json(bank, { status: 201 });
}
