type UnknownRecord = Record<string, unknown>;

export type InvoiceItemRecord = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

export type SavedInvoice = {
  id: string;
  client_name: string;
  client_phone: string;
  payment_method: string;
  items: InvoiceItemRecord[];
  total: number;
  markdown: string;
  image_url: string;
  status: string;
  sent_at: string;
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

function normalizeItems(value: unknown): InvoiceItemRecord[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      const record = asRecord(item);
      const quantity = Number(record.quantity);
      const unitPrice = Number(record.unitPrice);
      return {
        id: asString(record.id, "id") ?? `item-${index + 1}`,
        description: asString(record.description, "descripción") ?? "",
        quantity: Number.isFinite(quantity) && quantity > 0 ? String(quantity) : "1",
        unitPrice:
          Number.isFinite(unitPrice) && unitPrice >= 0 ? String(unitPrice) : "0",
      };
    })
    .filter((item) => item.description);
}

export function normalizeInvoiceInput(input: unknown, partial = false) {
  const body = asRecord(input);
  const data: Record<string, unknown> = {};
  const has = (key: string) => Object.prototype.hasOwnProperty.call(body, key);

  if (!partial || has("clientName")) {
    data.client_name = asString(body.clientName, "cliente", true) ?? "Por definir";
  }
  if (!partial || has("clientPhone")) {
    data.client_phone = asString(body.clientPhone, "teléfono") ?? "";
  }
  if (!partial || has("paymentMethod")) {
    data.payment_method =
      asString(body.paymentMethod, "método de pago") ?? "Por definir";
  }
  if (!partial || has("items")) {
    const items = normalizeItems(body.items);
    if (items.length === 0) throw new Error("Agrega al menos un producto a la factura.");
    data.items = items;
    data.total = items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      return total + quantity * unitPrice;
    }, 0);
  }
  if (!partial || has("markdown")) {
    data.markdown = asString(body.markdown, "recibo") ?? "";
  }
  if (!partial || has("imageUrl")) {
    data.image_url = asString(body.imageUrl, "imagen") ?? "";
  }
  if (!partial || has("status")) {
    const status = asString(body.status, "estado") ?? "Enviada";
    const allowed = new Set(["Enviada", "Pagada", "Pendiente", "Anulada"]);
    data.status = allowed.has(status) ? status : "Enviada";
  }

  return data;
}

export function mapInvoiceRow(row: UnknownRecord): SavedInvoice {
  return {
    id: String(row.id ?? ""),
    client_name: String(row.client_name ?? "Por definir"),
    client_phone: String(row.client_phone ?? ""),
    payment_method: String(row.payment_method ?? "Por definir"),
    items: normalizeItems(row.items),
    total: Number(row.total ?? 0),
    markdown: String(row.markdown ?? ""),
    image_url: String(row.image_url ?? ""),
    status: String(row.status ?? "Enviada"),
    sent_at: String(row.sent_at ?? ""),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}
