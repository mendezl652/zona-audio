import { NextResponse } from "next/server";
import { requireAdmin, serverError, unauthorized } from "@/lib/admin/api";
import { calculateSale, mapSaleRow, normalizeSaleInput } from "@/lib/admin/sales";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const { data, error } = await admin.db
      .from("sales")
      .select("*")
      .order("sale_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({
      sales: (data ?? []).map((row) => mapSaleRow(row as Record<string, unknown>)),
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const data = normalizeSaleInput(await request.json());
    const { data: product, error: productError } = await admin.db
      .from("products")
      .select("id, name, price")
      .eq("id", data.product_id)
      .single();
    if (productError || !product) throw new Error("El producto ya no está disponible.");

    const sale = {
      ...data,
      ...calculateSale(
        String(product.name),
        Number(product.price ?? 0),
        Number(data.quantity),
        Number(data.unit_cost ?? 0)
      ),
    };
    const { data: created, error } = await admin.db
      .from("sales")
      .insert(sale)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json(mapSaleRow(created as Record<string, unknown>), {
      status: 201,
    });
  } catch (error) {
    return serverError(error);
  }
}
