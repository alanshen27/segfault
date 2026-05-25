import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const skill = searchParams.get("skill");
  const interest = searchParams.get("interest");
  const openTo = searchParams.get("openTo");

  const where: Record<string, unknown> = {};
  if (skill) where.skills = { has: skill };
  if (interest) where.interests = { has: interest };
  if (openTo) where.openTo = { has: openTo };

  const profiles = await prisma.builderProfile.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(profiles);
}

interface UpsertBuilderBody {
  bio?: string;
  skills: string[];
  interests: string[];
  timezone?: string;
  school?: string;
  openTo: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: UpsertBuilderBody = await request.json();

  const profile = await prisma.builderProfile.upsert({
    where: { userId: user.id },
    update: {
      bio: body.bio?.trim() || null,
      skills: body.skills ?? [],
      interests: body.interests ?? [],
      timezone: body.timezone?.trim() || null,
      school: body.school?.trim() || null,
      openTo: body.openTo ?? [],
      githubUrl: body.githubUrl?.trim() || null,
      linkedinUrl: body.linkedinUrl?.trim() || null,
      websiteUrl: body.websiteUrl?.trim() || null,
    },
    create: {
      userId: user.id,
      bio: body.bio?.trim() || null,
      skills: body.skills ?? [],
      interests: body.interests ?? [],
      timezone: body.timezone?.trim() || null,
      school: body.school?.trim() || null,
      openTo: body.openTo ?? [],
      githubUrl: body.githubUrl?.trim() || null,
      linkedinUrl: body.linkedinUrl?.trim() || null,
      websiteUrl: body.websiteUrl?.trim() || null,
    },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(profile);
}
