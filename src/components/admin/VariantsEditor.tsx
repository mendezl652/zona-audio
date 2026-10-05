"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import type { ProductVariant } from "@/data/products";

type Props = {
  productId: string | null;
  variantes: ProductVariant[];
  onChanged: () => Promise<void> | void;
};

type Fila = {
  id: string | null;
  name: string;
  price: string;
  stock: string;
  isActive: boolean;
};

const campo =
  "w-full rounded-xl border border-[#52525B] bg-[#121212] px-3 py-2 text-xs text-white outline-none transition placeholder:text-[#e3deda] focus:border-[#d47217]";

function aFila(v: ProductVariant): Fila {
  return {
    id: v.id,
    name: v.name,
    price: String(v.price),
    stock: String(v.stock),
    isActive: v.isActive,
  };
}

/**
 * Administracion de variantes (medidas, packs, etc.).
 * Solo funciona sobre un producto ya guardado, porque las variantes
 * se relacionan con el id del producto en la base de datos.
 */
export function VariantsEditor({ productId, variantes, onChanged }: Props) {
  const [filas, setFilas] = useState<Fila[]>([]);
  const [cargado, setCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Sincroniza la lista solo cuando el producto tiene variantes por mostrar.
  if (productId && !cargado && filas.length === 0 && variantes.length > 0) {
    setCargado(true);
    setFilas(variantes.map(aFila));
  }

  if (!productId) {
    return (
      <div className="rounded-2xl border border-dashed border-[#52525B] px-3 py-4 text-[11px] text-[#e3deda]">
        Guarda el producto una vez para poder agregar variantes como medidas o
        packs.
      </div>
    );
  }

  const cambiar = (indice: number, parche: Partial<Fila>) =>
    setFilas((actual) =>
      actual.map((f, i) => (i === indice ? { ...f, ...parche } : f))
    );

  const agregarFila = () =>
    setFilas((actual) => [
      ...actual,
      { id: null, name: "", price: "", stock: "0", isActive: true },
    ]);

  const guardar = async () => {
    setGuardando(true);
    setError("");
    try {
      for (const fila of filas) {
        if (!fila.name.trim()) continue;
        const cuerpo = JSON.stringify({
          productId,
          name: fila.name,
          price: fila.price,
          stock: fila.stock,
          isActive: fila.isActive,
          sortOrder: 0,
        });

        if (fila.id) {
          const res = await fetch(`/api/admin/variants/${fila.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: cuerpo,
          });
          if (!res.ok) {
            const err = (await res.json()) as { error?: string };
            throw new Error(err.error ?? "No se pudo actualizar la variante.");
          }
        } else {
          const res = await fetch("/api/admin/variants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: cuerpo,
          });
          if (!res.ok) {
            const err = (await res.json()) as { error?: string };
            throw new Error(err.error ?? "No se pudo crear la variante.");
          }
        }
      }
      await onChanged();
      setCargado(false);
      setFilas([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron guardar las variantes.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: string) => {
    if (!window.confirm("¿Eliminar esta variante?")) return;
    setGuardando(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/variants/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar la variante.");
      setFilas((actual) => actual.filter((f) => f.id !== id));
      await onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border border-[#3F3F46] bg-[#121212] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-white">
          Variantes (medidas, packs)
        </span>
        <button
          type="button"
          onClick={agregarFila}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#52525B] px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:border-[#d47217]"
        >
          <Plus className="h-3 w-3" /> Agregar
        </button>
      </div>

      <p className="text-[10px] text-[#e3deda]">
        Si agregas variantes, el cliente debe elegir una antes de comprar. Cada
        una se vende por separado y puede tener su propio precio y stock.
      </p>

      {filas.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#52525B] px-3 py-4 text-center text-[11px] text-[#e3deda]">
          Este producto se vende como una sola opción. Agrega variantes si
          tienes distintas medidas o packs.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_90px_80px_auto_auto]">
            <span className="text-[10px] uppercase tracking-wider text-[#e3deda]">
              Opción
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#e3deda]">
              Precio
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#e3deda]">
              Stock
            </span>
            <span />
            <span />
          </div>
          {filas.map((fila, indice) => (
            <div
              key={fila.id ?? `nueva-${indice}`}
              className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_90px_80px_auto_auto] sm:items-center"
            >
              <input
                className={campo}
                value={fila.name}
                onChange={(e) => cambiar(indice, { name: e.target.value })}
                placeholder="Ej.: 3 metros"
                aria-label="Nombre de la variante"
              />
              <input
                className={campo}
                type="number"
                min="0"
                step="0.01"
                value={fila.price}
                onChange={(e) => cambiar(indice, { price: e.target.value })}
                placeholder="22.00"
                aria-label="Precio"
              />
              <input
                className={campo}
                type="number"
                min="0"
                step="1"
                value={fila.stock}
                onChange={(e) => cambiar(indice, { stock: e.target.value })}
                placeholder="0"
                aria-label="Stock"
              />
              <label className="flex items-center gap-1.5 text-[10px] text-[#e3deda]">
                <input
                  type="checkbox"
                  checked={fila.isActive}
                  onChange={(e) => cambiar(indice, { isActive: e.target.checked })}
                  className="h-3.5 w-3.5 accent-[#d47217]"
                />
                Activa
              </label>
              {fila.id ? (
                <button
                  type="button"
                  onClick={() => eliminar(fila.id as string)}
                  disabled={guardando}
                  className="rounded-lg border border-red-400/30 p-1.5 text-red-200 transition hover:bg-red-400/10"
                  aria-label="Eliminar variante"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setFilas((actual) => actual.filter((_, i) => i !== indice))
                  }
                  className="rounded-lg border border-[#52525B] p-1.5 text-[#e3deda] transition hover:border-red-400/40 hover:text-red-200"
                  aria-label="Quitar fila"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-[11px] text-red-300">{error}</p>}

      {filas.length > 0 && (
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#d47217] px-4 py-2.5 text-xs font-black text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {guardando ? "Guardando..." : "Guardar variantes"}
        </button>
      )}
    </div>
  );
}