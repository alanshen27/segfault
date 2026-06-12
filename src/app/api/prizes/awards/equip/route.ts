import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: { awardId: string; equipped: boolean } = await request.json();

  if (!body.awardId) {
    return NextResponse.json({ error: "awardId is required" }, { status: 400 });
  }

  const award = await prisma.prizeAward.findUnique({
    where: { id: body.awardId },
    include: { prize: true },
  });

  if (!award || award.userId !== user.id) {
    return NextResponse.json({ error: "Award not found" }, { status: 404 });
  }

  if (award.prize.type !== "BADGE" && award.prize.type !== "COSMETIC") {
    return NextResponse.json(
      { error: "Only badges and cosmetics can be equipped" },
      { status: 400 },
    );
  }

  if (body.equipped) {
    await prisma.prizeAward.updateMany({
      where: {
        userId: user.id,
        equipped: true,
        prize: { type: award.prize.type },
      },
      data: { equipped: false },
    });
  }

  const updated = await prisma.prizeAward.update({
    where: { id: body.awardId },
    data: { equipped: body.equipped },
    include: {
      prize: {
        select: { id: true, name: true, type: true, rarity: true, imageUrl: true },
      },
    },
  });

  return NextResponse.json(updated);
}
