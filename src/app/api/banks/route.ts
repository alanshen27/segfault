import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type Prisma } from "@/generated/prisma/client";

interface BankCreateBody {
  name: string;
  description: string;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim();
  const sort = url.searchParams.get("sort") ?? "newest";

  const where: Prisma.QuestionBankWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  type BankOrderBy = Prisma.QuestionBankOrderByWithRelationInput;
  let orderBy: BankOrderBy = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };
  else if (sort === "name") orderBy = { name: "asc" };
  else if (sort === "problems") orderBy = { questions: { _count: "desc" } };

  const banks = await prisma.questionBank.findMany({
    where,
    include: {
      createdBy: { select: { name: true } },
      _count: { select: { questions: true } },
    },
    orderBy,
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
