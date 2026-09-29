"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type BcvRateData = {
  rate: number;
  date: string;
  fetchedAt: string;
  source: string;
};

type BcvRateContextValue = BcvRateData & {
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const CACHE_KEY = "aura_vip_bcv_rate";
const BcvRateContext = createContext<BcvRateContextValue | null>(null);

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

function readCachedRate(): BcvRateData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as BcvRateData;
    if (
      typeof cached.rate !== "number" ||
      !Number.isFinite(cached.rate) ||
      cached.rate <= 0
    ) {
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

export function formatVes(amount: number): string {
  return `Bs. ${amount.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const BcvRateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<BcvRateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/bcv", { cache: "no-store" });
      if (!response.ok) throw new Error("No se pudo consultar la tasa BCV");
      const payload = (await response.json()) as Partial<BcvRateData>;
      if (typeof payload.rate !== "number" || !Number.isFinite(payload.rate)) {
        throw new Error("La tasa BCV recibida no es válida");
      }
      const nextData: BcvRateData = {
        rate: payload.rate,
        date: payload.date ?? getCaracasDate(),
        fetchedAt: payload.fetchedAt ?? new Date().toISOString(),
        source: payload.source ?? "BCV",
      };
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(nextData));
      setData(nextData);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo consultar la tasa BCV"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = readCachedRate();
    let active = true;
    let timer: number | undefined;

    if (cached?.date === getCaracasDate()) {
      timer = window.setTimeout(() => {
        if (active) {
          setData(cached);
          setIsLoading(false);
        }
      }, 0);
    } else {
      timer = window.setTimeout(() => {
        void refresh();
      }, 0);
    }

    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [refresh]);

  return (
    <BcvRateContext.Provider
      value={{
        rate: data?.rate ?? 0,
        date: data?.date ?? "",
        fetchedAt: data?.fetchedAt ?? "",
        source: data?.source ?? "BCV",
        isLoading,
        error,
        refresh,
      }}
    >
      {children}
    </BcvRateContext.Provider>
  );
};

export function useBcvRate(): BcvRateContextValue {
  const context = useContext(BcvRateContext);
  if (!context) {
    throw new Error("useBcvRate debe utilizarse dentro de BcvRateProvider");
  }
  return context;
}
