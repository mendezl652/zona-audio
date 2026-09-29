import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  isAllowedAdminEmail,
} from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;

  const email = body?.email?.trim().toLowerCase();
  const password = body?.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Ingresa tu correo y contraseña." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase no está configurado en el servidor." },
      { status: 503 }
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: "Correo o contraseña incorrectos." },
      { status: 401 }
    );
  }

  if (!isAllowedAdminEmail(data.user.email)) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: "Este correo no tiene permisos de administrador." },
      { status: 403 }
    );
  }

  return NextResponse.json({ email: data.user.email });
}
