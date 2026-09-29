import { NextResponse } from "next/server";
import { requireAdmin, serverError, unauthorized } from "@/lib/admin/api";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { name?: string };
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ error: "Escribe el nombre de la marca." }, { status: 400 });
    }

    const { data, error } = await admin.db
      .from("brands")
      .update({ name })
      .eq("id", id)
      .select("id, name")
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const { id } = await context.params;
    const { error } = await admin.db.from("brands").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
