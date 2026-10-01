import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  isAllowedAdminEmail,
} from "@/lib/supabase/server";
import {
  cabecerasSeguridad,
  getClientIp,
  permiteIntento,
  reiniciarIntentos,
  respuestaDemasiadosIntentos,
} from "@/lib/security";

export async function POST(request: Request) {
  // Frena la fuerza bruta: 5 intentos por IP cada 10 minutos.
  const ip = getClientIp(request);
  const clave = `login:${ip}`;
  if (!permiteIntento(clave)) {
    return respuestaDemasiadosIntentos(10);
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;

  const email = body?.email?.trim().toLowerCase();
  const password = body?.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Ingresa tu correo y contraseña." },
      { status: 400, headers: cabecerasSeguridad() }
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase no está configurado en el servidor." },
      { status: 503, headers: cabecerasSeguridad() }
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: "Correo o contraseña incorrectos." },
      { status: 401, headers: cabecerasSeguridad() }
    );
  }

  if (!isAllowedAdminEmail(data.user.email)) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: "Este correo no tiene permisos de administrador." },
      { status: 403, headers: cabecerasSeguridad() }
    );
  }

  // Login correcto: libera el limite para esa IP.
  reiniciarIntentos(clave);

  return NextResponse.json(
    { email: data.user.email },
    { headers: cabecerasSeguridad() }
  );
}
