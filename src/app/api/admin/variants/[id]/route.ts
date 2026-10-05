import { NextResponse } from "next/server";
import { requireAdmin, serverError, unauthorized } from "@/lib/admin/api";
import { mapVariantRow, normalizeVariantInput } from "@/lib/admin/variants";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const { id } = await context.params;
    const data = normalizeVariantInput(await request.json(), true);
    const { data: updated, error } = await admin.db
      .from("product_variants")
      .update(data)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json(mapVariantRow(updated));
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const { id } = await context.params;
    const { error } = await admin.db.from("product_variants").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}