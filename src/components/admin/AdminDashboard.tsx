"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Boxes,
  Check,
  LogOut,
  Package,
  Pencil,
  Plus,
  Save,
  Tags,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { Product } from "@/data/products";
import type { AdminCatalogSnapshot } from "@/lib/catalog";

type AdminTab = "products" | "categories" | "brands";

type ProductFormState = {
  id: string | null;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: string;
  originalPrice: string;
  stock: string;
  description: string;
  specs: string;
  features: string;
  images: string[];
  imageFit: "cover" | "contain";
  isPublished: boolean;
  isFeatured: boolean;
  isNew: boolean;
  hasAudioPreview: boolean;
};

const inputClass =
  "w-full rounded-xl border border-[#52525B] bg-[#121212] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-[#e3deda] focus:border-[#d47217]";
const labelClass = "text-xs font-semibold text-[#e3deda]";
const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#d47217] px-4 py-2.5 text-xs font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#52525B] bg-[#27272A] px-4 py-2.5 text-xs font-bold text-white transition hover:border-[#d47217]";

function emptyForm(): ProductFormState {
  return {
    id: null,
    name: "",
    brand: "Zona Audio",
    category: "",
    subcategory: "",
    price: "0",
    originalPrice: "",
    stock: "0",
    description: "",
    specs: "",
    features: "",
    images: [],
    imageFit: "cover",
    isPublished: true,
    isFeatured: false,
    isNew: false,
    hasAudioPreview: false,
  };
}

function productToForm(product: Product): ProductFormState {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    subcategory: product.subcategory,
    price: String(product.price ?? 0),
    originalPrice:
      product.originalPrice === undefined ? "" : String(product.originalPrice),
    stock: String(product.stock ?? 0),
    description: product.description,
    specs: Object.entries(product.specs ?? {})
      .map(([key, value]) => `${key}: ${value ?? ""}`)
      .join("\n"),
    features: (product.features ?? []).join("\n"),
    images: product.images ?? [],
    imageFit: product.imageFit === "contain" ? "contain" : "cover",
    isPublished: true,
    isFeatured: Boolean(product.isFeatured),
    isNew: Boolean(product.isNew),
    hasAudioPreview: Boolean(product.hasAudioPreview),
  };
}

export const AdminDashboard: React.FC<{ userEmail: string }> = ({
  userEmail,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [catalog, setCatalog] = useState<AdminCatalogSnapshot | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newBrand, setNewBrand] = useState("");

  const loadCatalog = useCallback(async () => {
    const response = await fetch("/api/admin/catalog", { cache: "no-store" });
    if (response.status === 401) {
      router.push("/admin/login");
      return;
    }
    const payload = (await response.json()) as AdminCatalogSnapshot & {
      error?: string;
    };
    if (!response.ok) {
      setStatus({ type: "error", text: payload.error ?? "No se pudo cargar el catálogo." });
      setIsLoading(false);
      return;
    }

    setCatalog(payload);
    setForm((current) => {
      if (current.id || current.name) return current;
      return {
        ...current,
        category: payload.categories[0]?.name ?? "",
        brand: payload.brands[0]?.name ?? "Zona Audio",
      };
    });
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCatalog();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadCatalog]);

  const selectedProduct = useMemo(
    () => catalog?.products.find((product) => product.id === form.id),
    [catalog, form.id]
  );

  const updateForm = <K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => setForm(emptyForm());

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleSaveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    if (!form.name.trim() || !form.category.trim() || !form.brand.trim()) {
      setStatus({ type: "error", text: "Completa nombre, marca y categoría." });
      return;
    }

    setIsSaving(true);
    try {
      const editing = Boolean(form.id);
      const response = await fetch(
        editing ? `/api/admin/products/${form.id}` : "/api/admin/products",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            brand: form.brand,
            category: form.category,
            subcategory: form.subcategory,
            price: form.price,
            originalPrice: form.originalPrice,
            stock: form.stock,
            description: form.description,
            specs: form.specs,
            features: form.features,
            images: form.images,
            imageFit: form.imageFit,
            isPublished: form.isPublished,
            isFeatured: form.isFeatured,
            isNew: form.isNew,
            hasAudioPreview: form.hasAudioPreview,
            rating: selectedProduct?.rating ?? 0,
            reviewCount: selectedProduct?.reviewCount ?? 0,
            isBestSeller: selectedProduct?.isBestSeller ?? false,
            isTopDeal: selectedProduct?.isTopDeal ?? false,
            freeShipping: selectedProduct?.freeShipping ?? false,
            soundDemo: selectedProduct?.soundDemo ?? {
              type: "drums_latin",
              duration: 5,
              notesDescription: form.name,
            },
          }),
        }
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo guardar el producto.");
      }
      await loadCatalog();
      resetForm();
      setStatus({ type: "success", text: "Producto guardado correctamente." });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo guardar el producto.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`¿Eliminar "${product.name}"?`)) return;
    const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus({ type: "error", text: "No se pudo eliminar el producto." });
      return;
    }
    if (form.id === product.id) resetForm();
    await loadCatalog();
    setStatus({ type: "success", text: "Producto eliminado." });
  };

  const handleUploadImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    setIsUploading(true);
    setStatus(null);
    const uploadedUrls = [...form.images];
    try {
      for (const file of files) {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body });
        const payload = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !payload.url) {
          throw new Error(payload.error ?? "No se pudo subir la imagen.");
        }
        uploadedUrls.push(payload.url);
      }
      setForm((current) => ({ ...current, images: uploadedUrls }));
      setStatus({ type: "success", text: "Imágenes subidas correctamente." });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo subir la imagen.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newCategory.trim()) return;
    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus({ type: "error", text: payload.error ?? "No se pudo crear la categoría." });
      return;
    }
    setNewCategory("");
    await loadCatalog();
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar la categoría "${name}"?`)) return;
    const response = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus({ type: "error", text: "No se pudo eliminar la categoría." });
      return;
    }
    await loadCatalog();
  };

  const handleAddBrand = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newBrand.trim()) return;
    const response = await fetch("/api/admin/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newBrand }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus({ type: "error", text: payload.error ?? "No se pudo crear la marca." });
      return;
    }
    setNewBrand("");
    await loadCatalog();
  };

  const handleDeleteBrand = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar la marca "${name}"?`)) return;
    const response = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus({ type: "error", text: "No se pudo eliminar la marca." });
      return;
    }
    await loadCatalog();
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#121212] text-[#e3deda]">
        Cargando panel...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#121212] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-[#3F3F46] bg-[#27272A] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d47217]">Zona Audio</p>
            <h1 className="mt-1 text-2xl font-black">Panel privado</h1>
            <p className="mt-1 text-xs text-[#e3deda]">Sesión: {userEmail}</p>
          </div>
          <button type="button" onClick={handleLogout} className={secondaryButton}>
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </header>

        {status && (
          <div
            role="status"
            className={`rounded-xl border px-4 py-3 text-sm ${
              status.type === "success"
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                : "border-red-400/30 bg-red-400/10 text-red-200"
            }`}
          >
            {status.text}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {([
            ["products", "Productos", Package],
            ["categories", "Categorías", Tags],
            ["brands", "Marcas", Boxes],
          ] as const).map(([tab, label, Icon]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                activeTab === tab
                  ? "bg-[#d47217] text-white"
                  : "border border-[#52525B] bg-[#27272A] text-[#e3deda] hover:border-[#d47217]"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {activeTab === "products" && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black">Productos ({catalog?.products.length ?? 0})</h2>
                <button type="button" onClick={resetForm} className={secondaryButton}>
                  <Plus className="h-4 w-4" /> Nuevo producto
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {(catalog?.products ?? []).map((product) => (
                  <article key={product.id} className="rounded-2xl border border-[#3F3F46] bg-[#27272A] p-4">
                    <div className="flex gap-3">
                      <div
                        className="h-20 w-20 shrink-0 rounded-xl bg-cover bg-center"
                        style={{
                          backgroundImage: product.images[0] ? `url("${product.images[0]}")` : undefined,
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-[#d47217]">{product.category}</p>
                        <h3 className="mt-1 line-clamp-2 font-bold">{product.name}</h3>
                        <p className="mt-1 text-xs text-[#e3deda]">
                          {product.brand} • ${product.price.toLocaleString("es-VE")} • stock {product.stock}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button type="button" onClick={() => setForm(productToForm(product))} className={secondaryButton}>
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                      <button type="button" onClick={() => handleDeleteProduct(product)} className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 px-3 py-2 text-xs font-bold text-red-200 transition hover:bg-red-400/10">
                        <Trash2 className="h-3.5 w-3.5" /> Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-[#3F3F46] bg-[#27272A] p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black">{form.id ? "Editar producto" : "Nuevo producto"}</h2>
                {form.id && (
                  <button type="button" onClick={resetForm} className="text-xs text-[#e3deda] hover:text-white">
                    Cancelar
                  </button>
                )}
              </div>
              <form onSubmit={handleSaveProduct} className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="product-name">Nombre</label>
                  <input id="product-name" className={inputClass} value={form.name} onChange={(e) => updateForm("name", e.target.value)} required />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="product-brand">Marca</label>
                    <select id="product-brand" className={inputClass} value={form.brand} onChange={(e) => updateForm("brand", e.target.value)}>
                      {(catalog?.brands ?? []).map((brand) => <option key={brand.id} value={brand.name}>{brand.name}</option>)}
                      {!catalog?.brands.some((brand) => brand.name === form.brand) && <option value={form.brand}>{form.brand}</option>}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="product-category">Categoría</label>
                    <select id="product-category" className={inputClass} value={form.category} onChange={(e) => updateForm("category", e.target.value)} required>
                      <option value="">Selecciona una categoría</option>
                      {(catalog?.categories ?? []).map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="product-subcategory">Subcategoría</label>
                  <input id="product-subcategory" className={inputClass} value={form.subcategory} onChange={(e) => updateForm("subcategory", e.target.value)} />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="product-price">Precio USD</label>
                    <input id="product-price" type="number" min="0" step="0.01" className={inputClass} value={form.price} onChange={(e) => updateForm("price", e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="product-original-price">Precio anterior</label>
                    <input id="product-original-price" type="number" min="0" step="0.01" className={inputClass} value={form.originalPrice} onChange={(e) => updateForm("originalPrice", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="product-stock">Stock</label>
                    <input id="product-stock" type="number" min="0" step="1" className={inputClass} value={form.stock} onChange={(e) => updateForm("stock", e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="product-description">Descripción</label>
                  <textarea id="product-description" rows={4} className={inputClass} value={form.description} onChange={(e) => updateForm("description", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="product-specs">Especificaciones (una por línea: Clave: valor)</label>
                  <textarea id="product-specs" rows={4} className={inputClass} value={form.specs} onChange={(e) => updateForm("specs", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="product-features">Características (una por línea)</label>
                  <textarea id="product-features" rows={3} className={inputClass} value={form.features} onChange={(e) => updateForm("features", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="product-image-fit">Ajuste de imagen</label>
                  <select id="product-image-fit" className={inputClass} value={form.imageFit} onChange={(e) => updateForm("imageFit", e.target.value as "cover" | "contain")}>
                    <option value="cover">Cubrir espacio</option>
                    <option value="contain">Mostrar imagen completa</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <span className={labelClass}>Imágenes</span>
                  <div className="flex flex-wrap gap-2">
                    {form.images.map((url) => (
                      <div key={url} className="relative h-20 w-20 overflow-hidden rounded-xl border border-[#52525B] bg-cover bg-center" style={{ backgroundImage: `url("${url}")` }}>
                        <button type="button" onClick={() => updateForm("images", form.images.filter((image) => image !== url))} className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white" aria-label="Quitar imagen">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#d47217] text-[#e3deda] transition hover:bg-[#d47217]/10">
                      <Upload className="h-5 w-5" />
                      <span className="text-[10px]">{isUploading ? "Subiendo..." : "Subir"}</span>
                      <input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" multiple className="sr-only" onChange={handleUploadImages} disabled={isUploading} />
                    </label>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    ["isPublished", "Publicado"],
                    ["isFeatured", "Destacado"],
                    ["isNew", "Novedad"],
                    ["hasAudioPreview", "Vista previa de audio"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 text-xs text-[#e3deda]">
                      <input type="checkbox" checked={form[key as keyof ProductFormState] as boolean} onChange={(e) => updateForm(key as keyof ProductFormState, e.target.checked as never)} className="h-4 w-4 accent-[#d47217]" />
                      {label}
                    </label>
                  ))}
                </div>
                <button type="submit" disabled={isSaving || isUploading} className={`${primaryButton} w-full`}>
                  {isSaving ? <><Save className="h-4 w-4" /> Guardando...</> : <><Check className="h-4 w-4" /> Guardar producto</>}
                </button>
              </form>
            </section>
          </div>
        )}

        {activeTab === "categories" && (
          <section className="max-w-2xl space-y-4 rounded-3xl border border-[#3F3F46] bg-[#27272A] p-5">
            <div>
              <h2 className="text-lg font-black">Categorías</h2>
              <p className="mt-1 text-xs text-[#e3deda]">Crea las categorías que aparecerán en el filtro de la tienda.</p>
            </div>
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input className={inputClass} value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nueva categoría" />
              <button type="submit" className={primaryButton}><Plus className="h-4 w-4" /> Añadir</button>
            </form>
            <div className="space-y-2">
              {(catalog?.categories ?? []).map((category) => (
                <div key={category.id} className="flex items-center justify-between rounded-xl border border-[#3F3F46] bg-[#121212] px-3 py-2.5 text-sm">
                  <span>{category.name}</span>
                  <button type="button" onClick={() => handleDeleteCategory(category.id, category.name)} className="text-red-200 hover:text-red-100" aria-label={`Eliminar ${category.name}`}><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "brands" && (
          <section className="max-w-2xl space-y-4 rounded-3xl border border-[#3F3F46] bg-[#27272A] p-5">
            <div>
              <h2 className="text-lg font-black">Marcas</h2>
              <p className="mt-1 text-xs text-[#e3deda]">Administra las marcas disponibles para los productos.</p>
            </div>
            <form onSubmit={handleAddBrand} className="flex gap-2">
              <input className={inputClass} value={newBrand} onChange={(e) => setNewBrand(e.target.value)} placeholder="Nueva marca" />
              <button type="submit" className={primaryButton}><Plus className="h-4 w-4" /> Añadir</button>
            </form>
            <div className="space-y-2">
              {(catalog?.brands ?? []).map((brand) => (
                <div key={brand.id} className="flex items-center justify-between rounded-xl border border-[#3F3F46] bg-[#121212] px-3 py-2.5 text-sm">
                  <span>{brand.name}</span>
                  <button type="button" onClick={() => handleDeleteBrand(brand.id, brand.name)} className="text-red-200 hover:text-red-100" aria-label={`Eliminar ${brand.name}`}><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};
