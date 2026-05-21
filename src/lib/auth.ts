import { createClient as createSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

export async function getSession() {
  const supabase = await createSupabaseClient();
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user) return null;

  let user = await prisma.user.findUnique({
    where: { supabaseId: session.user.id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        supabaseId: session.user.id,
        email: session.user.email ?? "",
        name:
          session.user.user_metadata?.full_name ??
          session.user.email?.split("@")[0] ??
          "User",
        role: "USER",
      },
    });
  }

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireModerator() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "MODERATOR" && user.role !== "ADMIN")) {
    throw new Error("Unauthorized: moderator access required");
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized: admin access required");
  }
  return user;
}
