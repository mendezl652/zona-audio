import { NextResponse } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/server";

// Diagnóstico temporal: indica a qué proyecto de Supabase apunta este entorno.
// Muestra solo el identificador del proyecto, nunca las claves.
export const dynamic = "force-dynamic";

export async function GET() {
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
    { headers: { "Cache-Control": "no-store" } }
  );
}