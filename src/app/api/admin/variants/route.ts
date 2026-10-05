import { NextResponse } from "next/server";
import { requireAdmin, serverError, unauthorized } from "@/lib/admin/api";
import { mapVariantRow, normalizeVariantInput } from "@/lib/admin/variants";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const productId = new URL(request.url).searchParams.get("productId");
    let consulta = admin.db.from("product_variants").select("*").order("sort_order");
    if (productId) consulta = consulta.eq("product_id", productId);

    const { data, error } = await consulta;
    if (error) throw new Error(error.message);
    return NextResponse.json({
      variants: (data ?? []).map((row) => mapVariantRow(row)),
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const data = normalizeVariantInput(await request.json());
    const { data: created, error } = await admin.db
      .from("product_variants")
      .insert(data)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json(mapVariantRow(created), { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
