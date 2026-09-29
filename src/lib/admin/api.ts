import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/server";

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) return null;

  try {
    return {
      db: createSupabaseAdminClient(),
      user: session.user,
    };
  } catch {
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json({ error: "No autorizado." }, { status: 401 });
}

export function serverError(error: unknown) {
  const message = error instanceof Error ? error.message : "Error inesperado.";
  return NextResponse.json({ error: message }, { status: 500 });
}
