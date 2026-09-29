import { NextResponse } from "next/server";
import { requireAdmin, serverError, unauthorized } from "@/lib/admin/api";
import { getAdminCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const catalog = await getAdminCatalog();
    return NextResponse.json(catalog);
  } catch (error) {
    return serverError(error);
  }
}
