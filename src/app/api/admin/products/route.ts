import { NextResponse } from "next/server";
import { requireAdmin, serverError, unauthorized } from "@/lib/admin/api";
import { normalizeProductInput } from "@/lib/admin/products";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const body = await request.json();
    const data = normalizeProductInput(body);
    const { data: created, error } = await admin.db
      .from("products")
      .insert(data)
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
