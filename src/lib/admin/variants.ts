type UnknownRecord = Record<string, unknown>;

export type ProductVariant = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
  sort_order: number;
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

function asBoolean(value: unknown) {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function normalizeVariantInput(input: unknown, partial = false) {
  const body = asRecord(input);
  const data: Record<string, unknown> = {};
  const has = (key: string) => Object.prototype.hasOwnProperty.call(body, key);

  if (!partial || has("productId")) {
    data.product_id = asString(body.productId, "producto", true);
  }
  if (!partial || has("name")) {
    data.name = asString(body.name, "nombre de la variante", true);
  }
  if (!partial || has("price")) {
    data.price = asNumber(body.price, "precio", true) ?? 0;
  }
  if (!partial || has("stock")) {
    data.stock = Math.round(asNumber(body.stock, "stock", true) ?? 0);
  }
  if (!partial || has("isActive")) {
    data.is_active = body.isActive === undefined ? true : asBoolean(body.isActive);
  }
  if (!partial || has("sortOrder")) {
    data.sort_order = Math.round(asNumber(body.sortOrder, "orden") ?? 0);
  }
  return data;
}

export function mapVariantRow(row: UnknownRecord): ProductVariant {
  return {
    id: String(row.id ?? ""),
    product_id: String(row.product_id ?? ""),
    name: String(row.name ?? "Variante"),
    price: Number(row.price ?? 0),
    stock: Number(row.stock ?? 0),
    is_active: row.is_active !== false,
    sort_order: Number(row.sort_order ?? 0),
  };
}