import { NextResponse } from "next/server";
import { requireAdmin, serverError, unauthorized } from "@/lib/admin/api";
import { calculateSale, mapSaleRow, normalizeSaleInput } from "@/lib/admin/sales";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const { id } = await context.params;
    const { data: current, error: currentError } = await admin.db
      .from("sales")
      .select("*")
      .eq("id", id)
      .single();
    if (currentError || !current) throw new Error("No se encontró la venta.");

    const existing = mapSaleRow(current as Record<string, unknown>);
    const changes = normalizeSaleInput(
      {
        productId: existing.product_id,
        quantity: existing.quantity,
        unitCost: existing.unit_cost,
        saleDate: existing.sale_date,
        notes: existing.notes,
        ...(await request.json()),
      },
      true
    );
    const productId = String(changes.product_id ?? existing.product_id);
    const { data: product, error: productError } = await admin.db
      .from("products")
      .select("id, name, price")
      .eq("id", productId)
      .single();
    if (productError || !product) throw new Error("El producto ya no está disponible.");

    const quantity = Number(changes.quantity ?? existing.quantity);
    const unitCost = Number(changes.unit_cost ?? existing.unit_cost);
    const data = {
      ...changes,
      product_id: productId,
      ...calculateSale(
        String(product.name),
        Number(product.price ?? 0),
        quantity,
        unitCost
      ),
    };
    const { data: updated, error } = await admin.db
      .from("sales")
      .update(data)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json(mapSaleRow(updated as Record<string, unknown>));
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const { id } = await context.params;
    const { error } = await admin.db.from("sales").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
