import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.question.findMany({
    where: { approved: true },
    select: { topic: true },
    distinct: ["topic"],
    orderBy: { topic: "asc" },
  });

  return NextResponse.json(rows.map((r) => r.topic));
}
