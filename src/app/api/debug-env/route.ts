import { NextResponse } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/server";
import { cabecerasSeguridad } from "@/lib/security";

// Diagnóstico del entorno: indica a qué proyecto de Supabase apunta este
// Worker y qué categorías existen. Requiere sesión de administrador.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  if (!cookie.includes("sb-")) {
    return NextResponse.json(
      { error: "Se requiere sesion de administrador." },
      { status: 401, headers: cabecerasSeguridad() }
    );
  }

  const { url, configured, serviceRoleKey } = getSupabaseEnv();
  let projectRef = "sin configurar";
  if (url) {
    const match = url.match(/https:\/\/([^.]+)\./);
    projectRef = match ? match[1] : "formato desconocido";
  }

  let categorias = "sin datos";
  if (configured && url && serviceRoleKey) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await supabase.from("categories").select("name");
    categorias = error ? `error: ${error.message}` : data.map((r) => r.name).join(" | ");
  }

  return NextResponse.json(
    { proyectoSupabase: projectRef, configurado: configured, categorias },
    { headers: { "Cache-Control": "no-store", ...cabecerasSeguridad() } }
  );
}