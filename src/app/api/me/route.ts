import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    supabaseId: user.supabaseId,
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

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    avatarUrl: updated.avatarUrl,
    supabaseId: updated.supabaseId,
  });
}
