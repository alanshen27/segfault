import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const prizeId = searchParams.get("prizeId");

  const where: Record<string, string> = {};
  if (userId) where.userId = userId;
  if (prizeId) where.prizeId = prizeId;

  const awards = await prisma.prizeAward.findMany({
    where,
    orderBy: { awardedAt: "desc" },
    include: {
      prize: {
        select: { id: true, name: true, type: true, rarity: true, imageUrl: true },
      },
      user: { select: { id: true, name: true, avatarUrl: true } },
      awardedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(awards);
}

interface AwardBody {
  prizeId: string;
  userId: string;
  reason: string;
}

export async function POST(request: NextRequest) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: AwardBody = await request.json();

  if (!body.prizeId || !body.userId || !body.reason?.trim()) {
    return NextResponse.json(
      { error: "prizeId, userId, and reason are required" },
      { status: 400 },
    );
  }

  const prize = await prisma.prize.findUnique({
    where: { id: body.prizeId },
    include: { _count: { select: { awards: true } } },
  });

  if (!prize || !prize.active) {
    return NextResponse.json({ error: "Prize not found or inactive" }, { status: 404 });
  }

  if (prize.maxSupply !== null && prize._count.awards >= prize.maxSupply) {
    return NextResponse.json(
      { error: "Prize has reached max supply" },
      { status: 400 },
    );
  }

  const award = await prisma.prizeAward.create({
    data: {
      prizeId: body.prizeId,
      userId: body.userId,
      reason: body.reason.trim(),
      awardedById: admin.id,
      claimStatus: prize.type === "PHYSICAL" ? "PENDING_CLAIM" : "NONE",
    },
    include: {
      prize: {
        select: { id: true, name: true, type: true, rarity: true, imageUrl: true },
      },
      user: { select: { id: true, name: true, avatarUrl: true } },
      awardedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(award, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: { id: string; claimStatus?: string; shippingInfo?: string } =
    await request.json();

  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const award = await prisma.prizeAward.update({
    where: { id: body.id },
    data: {
      ...(body.claimStatus && { claimStatus: body.claimStatus }),
      ...(body.shippingInfo !== undefined && { shippingInfo: body.shippingInfo }),
    },
    include: {
      prize: {
        select: { id: true, name: true, type: true, rarity: true, imageUrl: true },
      },
      user: { select: { id: true, name: true, avatarUrl: true } },
      awardedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(award);
}
