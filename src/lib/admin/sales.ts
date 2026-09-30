type UnknownRecord = Record<string, unknown>;

export type SaleRecord = {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
  unit_price: number;
  gross_revenue: number;
  total_cost: number;
  net_profit: number;
  sale_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function asString(value: unknown, field: string, required = false) {
  if (typeof value !== "string") {
    if (required) throw new Error(`El campo ${field} es obligatorio.`);
    return undefined;
  }
  const clean = value.trim();
  if (required && !clean) throw new Error(`El campo ${field} es obligatorio.`);
  return clean;
}

function asNumber(value: unknown, field: string, required = false) {
  if (value === "" || value === null || value === undefined) {
    if (required) throw new Error(`El campo ${field} es obligatorio.`);
    return undefined;
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`El campo ${field} no es válido.`);
  }
  return number;
}

export function normalizeSaleInput(input: unknown, partial = false) {
  const body = asRecord(input);
  const data: Record<string, unknown> = {};
  const has = (key: string) => Object.prototype.hasOwnProperty.call(body, key);

  if (!partial || has("productId")) {
    data.product_id = asString(body.productId, "producto", true);
  }
  if (!partial || has("quantity")) {
    const quantity = asNumber(body.quantity, "cantidad", true);
    if (!quantity || quantity <= 0) throw new Error("La cantidad debe ser mayor que cero.");
    data.quantity = quantity;
  }
  if (!partial || has("unitCost")) {
    data.unit_cost = asNumber(body.unitCost ?? 0, "costo unitario") ?? 0;
  }
  if (!partial || has("saleDate")) {
    const saleDate = asString(body.saleDate ?? new Date().toISOString().slice(0, 10), "fecha");
    if (!saleDate || !/^\d{4}-\d{2}-\d{2}$/.test(saleDate)) {
      throw new Error("La fecha no es válida.");
    }
    data.sale_date = saleDate;
  }
  if (!partial || has("notes")) {
    data.notes = asString(body.notes, "nota") ?? "";
  }
  return data;
}

export function calculateSale(
  productName: string,
  productPrice: number,
  quantity: number,
  unitCost: number
) {
  const grossRevenue = Number((productPrice * quantity).toFixed(2));
  const totalCost = Number((unitCost * quantity).toFixed(2));
  return {
    product_name: productName,
    unit_price: Number(productPrice.toFixed(2)),
    gross_revenue: grossRevenue,
    total_cost: totalCost,
    net_profit: Number((grossRevenue - totalCost).toFixed(2)),
  };
}

export function mapSaleRow(row: UnknownRecord): SaleRecord {
  return {
    id: String(row.id ?? ""),
    product_id: String(row.product_id ?? ""),
    product_name: String(row.product_name ?? ""),
    quantity: Number(row.quantity ?? 0),
    unit_cost: Number(row.unit_cost ?? 0),
    unit_price: Number(row.unit_price ?? 0),
    gross_revenue: Number(row.gross_revenue ?? 0),
    total_cost: Number(row.total_cost ?? 0),
    net_profit: Number(row.net_profit ?? 0),
    sale_date: String(row.sale_date ?? ""),
    notes: String(row.notes ?? ""),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}
