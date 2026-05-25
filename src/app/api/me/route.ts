import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const builderProfile = await prisma.builderProfile.findUnique({
    where: { userId: user.id },
    select: {
      bio: true,
      skills: true,
      interests: true,
      timezone: true,
      school: true,
      openTo: true,
      githubUrl: true,
      linkedinUrl: true,
      websiteUrl: true,
    },
  });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    supabaseId: user.supabaseId,
    builderProfile,
  });
}

interface ProfileUpdateBody {
  avatarUrl?: string | null;
  name?: string;
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: ProfileUpdateBody = await request.json();

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
      ...(body.name?.trim() && { name: body.name.trim() }),
    },
  });

  const builderProfile = await prisma.builderProfile.findUnique({
    where: { userId: updated.id },
    select: {
      bio: true,
      skills: true,
      interests: true,
      timezone: true,
      school: true,
      openTo: true,
      githubUrl: true,
      linkedinUrl: true,
      websiteUrl: true,
    },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    avatarUrl: updated.avatarUrl,
    supabaseId: updated.supabaseId,
    builderProfile,
  });
}
