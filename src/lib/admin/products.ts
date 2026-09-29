type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function numberValue(value: unknown, field: string, required = false) {
  if (value === "" || value === null || value === undefined) {
    if (required) throw new Error(`El campo ${field} es obligatorio.`);
    return undefined;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`El campo ${field} no es válido.`);
  }
  return parsed;
}

function booleanValue(value: unknown, field: string) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`El campo ${field} no es válido.`);
}

function stringValue(value: unknown, field: string, required = false) {
  if (typeof value !== "string") {
    if (required) throw new Error(`El campo ${field} es obligatorio.`);
    return undefined;
  }
  const clean = value.trim();
  if (required && !clean) throw new Error(`El campo ${field} es obligatorio.`);
  return clean;
}

function linesToSpecs(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value as UnknownRecord).map(([key, item]) => [
        key.trim(),
        String(item ?? ""),
      ])
    );
  }
  if (typeof value !== "string") return {};

  return Object.fromEntries(
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(":");
        if (separator === -1) return [line, ""];
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      })
  );
}

function toLines(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function normalizeProductInput(input: unknown, partial = false) {
  const body = asRecord(input);
  const data: Record<string, unknown> = {};
  const has = (key: string) => Object.prototype.hasOwnProperty.call(body, key);

  if (!partial || has("name")) {
    data.name = stringValue(body.name, "nombre", true);
  }
  if (!partial || has("brand")) {
    data.brand = stringValue(body.brand, "marca", true) ?? "Zona Audio";
  }
  if (!partial || has("category")) {
    data.category = stringValue(body.category, "categoría", true);
  }
  if (!partial || has("subcategory")) {
    data.subcategory = stringValue(body.subcategory, "subcategoría") ?? "";
  }
  if (!partial || has("price")) {
    data.price = numberValue(body.price, "precio", true);
  }
  if (has("originalPrice")) {
    data.original_price =
      body.originalPrice === "" || body.originalPrice === null
        ? null
        : numberValue(body.originalPrice, "precio original");
  }
  if (!partial || has("rating")) {
    data.rating = numberValue(body.rating ?? 0, "calificación") ?? 0;
  }
  if (!partial || has("reviewCount")) {
    data.review_count = numberValue(body.reviewCount ?? 0, "reseñas") ?? 0;
  }
  if (!partial || has("stock")) {
    data.stock = numberValue(body.stock ?? 0, "stock") ?? 0;
  }

  const booleans = [
    ["isNew", "is_new"],
    ["isFeatured", "is_featured"],
    ["isBestSeller", "is_best_seller"],
    ["isTopDeal", "is_top_deal"],
    ["hasAudioPreview", "has_audio_preview"],
    ["freeShipping", "free_shipping"],
    ["isPublished", "is_published"],
  ] as const;
  booleans.forEach(([inputKey, column]) => {
    if (!partial || has(inputKey)) {
      data[column] = booleanValue(body[inputKey] ?? false, inputKey);
    }
  });

  if (!partial || has("imageFit")) {
    const imageFit = stringValue(body.imageFit, "ajuste de imagen") ?? "cover";
    if (imageFit !== "cover" && imageFit !== "contain") {
      throw new Error("El ajuste de imagen no es válido.");
    }
    data.image_fit = imageFit;
  }
  if (!partial || has("images")) {
    if (!Array.isArray(body.images) || body.images.some((item) => typeof item !== "string")) {
      throw new Error("Las imágenes deben ser una lista de enlaces válidos.");
    }
    data.images = body.images;
  }
  if (!partial || has("description")) {
    data.description = stringValue(body.description, "descripción") ?? "";
  }
  if (!partial || has("specs")) {
    data.specs = linesToSpecs(body.specs);
  }
  if (!partial || has("features")) {
    data.features = toLines(body.features);
  }
  if (!partial || has("soundDemo")) {
    data.sound_demo = asRecord(body.soundDemo ?? {});
  }

  return data;
}
