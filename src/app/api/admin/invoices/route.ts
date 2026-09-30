import { NextResponse } from "next/server";
import { requireAdmin, serverError, unauthorized } from "@/lib/admin/api";
import { mapInvoiceRow, normalizeInvoiceInput } from "@/lib/admin/invoices";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const search = new URL(request.url).searchParams.get("search")?.trim().toLowerCase() ?? "";
    const { data, error } = await admin.db
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const invoices = (data ?? [])
      .map((row) => mapInvoiceRow(row as Record<string, unknown>))
      .filter((invoice) => {
        if (!search) return true;
        return [
          invoice.client_name,
          invoice.client_id_rif,
          invoice.client_phone,
          invoice.extra_description,
          invoice.payment_method,
          invoice.status,
          invoice.items.map((item) => item.description).join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);
      });

    return NextResponse.json({ invoices });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();

  try {
    const data = normalizeInvoiceInput(await request.json());
    const { data: created, error } = await admin.db
      .from("invoices")
      .insert(data)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json(mapInvoiceRow(created as Record<string, unknown>), {
      status: 201,
    });
  } catch (error) {
    return serverError(error);
  }
}
