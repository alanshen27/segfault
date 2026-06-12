import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const prizes = await prisma.prize.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { awards: true } } },
  });
  return NextResponse.json(prizes);
}

interface CreatePrizeBody {
  name: string;
  description: string;
  type: string;
  imageUrl?: string | null;
  rarity?: string;
  maxSupply?: number | null;
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: CreatePrizeBody = await request.json();

  if (!body.name?.trim() || !body.description?.trim() || !body.type?.trim()) {
    return NextResponse.json(
      { error: "name, description, and type are required" },
      { status: 400 },
    );
  }

  const prize = await prisma.prize.create({
    data: {
      name: body.name.trim(),
      description: body.description.trim(),
      type: body.type,
      imageUrl: body.imageUrl ?? null,
      rarity: body.rarity ?? "COMMON",
      maxSupply: body.maxSupply ?? null,
    },
    include: { _count: { select: { awards: true } } },
  });

  return NextResponse.json(prize, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: CreatePrizeBody & { id: string; active?: boolean } =
    await request.json();

  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const prize = await prisma.prize.update({
    where: { id: body.id },
    data: {
      ...(body.name?.trim() && { name: body.name.trim() }),
      ...(body.description?.trim() && { description: body.description.trim() }),
      ...(body.type && { type: body.type }),
      ...(body.rarity && { rarity: body.rarity }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.maxSupply !== undefined && { maxSupply: body.maxSupply }),
      ...(body.active !== undefined && { active: body.active }),
    },
    include: { _count: { select: { awards: true } } },
  });

  return NextResponse.json(prize);
}
