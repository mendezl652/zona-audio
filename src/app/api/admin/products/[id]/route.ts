import { NextResponse } from "next/server";
import { requireAdmin, serverError, unauthorized } from "@/lib/admin/api";
import { normalizeProductInput } from "@/lib/admin/products";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const { id } = await context.params;
    const data = normalizeProductInput(await request.json(), true);
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay cambios para guardar." }, { status: 400 });
    }

    const { error } = await admin.db
      .from("products")
      .update(data)
      .eq("id", id);

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const { id } = await context.params;
    const { error } = await admin.db.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
