import { NextResponse } from "next/server";

export const revalidate = 3600;

const SOURCES = [
  {
    url: "https://ve.dolarapi.com/v1/dolares/oficial",
    source: "DolarAPI (BCV)",
  },
  { url: "https://www.bcv.org.ve/pin.php", source: "BCV oficial" },
  {
    url: "https://pydolarve.org/api/v1/dollar?page=bcv",
    source: "PyDolar (BCV)",
  },
];

function getCaracasDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Caracas",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

function parseRate(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value !== "string") return null;
  const normalized = value
    .trim()
    .replace(/\s/g, "")
    .replace(/,/g, ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function findRateInJson(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const candidates = [
    record.precio,
    record.price,
    record.promedio,
    record.precioPromedio,
    record.rate,
    record.valor,
    record.value,
    record.usd,
  ];
  for (const candidate of candidates) {
    const rate = parseRate(candidate);
    if (rate) return rate;
  }
  return null;
}

function findDateInJson(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const candidates = [
    record.fechaActualizacion,
    record.fecha,
    record.date,
    record.updatedAt,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.slice(0, 10);
    }
  }
  return null;
}

function findRateInHtml(html: string): number | null {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ");

  const contextualMatches = [
    ...text.matchAll(
      /(?:USD|D[oó]lar|dolar)[^0-9]{0,120}([0-9]{1,3}(?:[.,][0-9]{3})*[.,][0-9]{2,4})/gi
    ),
  ];
  for (const match of contextualMatches) {
    const rate = parseRate(match[1]);
    if (rate && rate < 100000) return rate;
  }

  const candidates = [
    ...text.matchAll(/([0-9]{1,3}(?:[.,][0-9]{3})*[.,][0-9]{2,4})/g),
  ];
  for (const match of candidates) {
    const rate = parseRate(match[1]);
    if (rate && rate > 0 && rate < 100000) return rate;
  }
  return null;
}

async function fetchSource(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json,text/html;q=0.9,*/*;q=0.8",
        "User-Agent": "AuraVIP-BCV-Rate/1.0",
      },
      next: { revalidate: 3600 },
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  for (const source of SOURCES) {
    try {
      const response = await fetchSource(source.url);
      if (!response.ok) continue;
      const contentType = response.headers.get("content-type") ?? "";
      const body = await response.text();
      let rate: number | null = null;
      let sourceDate: string | null = null;
      if (contentType.includes("json")) {
        const payload = JSON.parse(body) as unknown;
        rate = findRateInJson(payload);
        sourceDate = findDateInJson(payload);
      } else {
        rate = findRateInHtml(body);
      }

      if (rate) {
        return NextResponse.json(
          {
            rate,
            source: source.source,
            date: sourceDate ?? getCaracasDate(),
            fetchedAt: new Date().toISOString(),
          },
          {
            headers: {
              "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
            },
          }
        );
      }
    } catch {
      // Try the next public BCV-compatible source.
    }
  }

  return NextResponse.json(
    { error: "No fue posible obtener la tasa oficial del BCV" },
    { status: 503 }
  );
}
