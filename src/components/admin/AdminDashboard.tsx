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
  Calculator,
  Check,
  Download,
  FileText,
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
import type { AdminCatalogSnapshot, AdminProduct } from "@/lib/catalog";
import type { SavedInvoice } from "@/lib/admin/invoices";
import type { SaleRecord } from "@/lib/admin/sales";
import { ProductPreviewCard } from "@/components/admin/ProductPreviewCard";

type AdminTab = "products" | "categories" | "brands" | "invoices" | "finance";

type InvoiceItem = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

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
  specs: SpecRow[];
  features: string;
  images: string[];
  imageFit: "cover" | "contain";
  isPublished: boolean;
  isFeatured: boolean;
  isNew: boolean;
  hasAudioPreview: boolean;
};

/** Una fila de la tabla "Especificaciones de fábrica". */
type SpecRow = {
  id: string;
  label: string;
  value: string;
};

/** Convierte el texto guardado en filas editables. */
function parseSpecs(rows: SpecRow[]): SpecRow[] {
  return rows.filter((row) => row.label.trim() || row.value.trim());
}

function specsToRows(specs: Record<string, string | undefined> | undefined): SpecRow[] {
  return Object.entries(specs ?? {})
    .filter(([label]) => label.trim())
    .map(([label, value], index) => ({
      id: `spec-${index}-${label}`,
      label,
      value: typeof value === "string" ? value : "",
    }));
}

function rowsToSpecsText(rows: SpecRow[]): string {
  return parseSpecs(rows)
    .map((row) => `${row.label.trim()}: ${row.value.trim()}`)
    .join("\n");
}

let specRowCounter = 0;
function createSpecRow(label = "", value = ""): SpecRow {
  specRowCounter += 1;
  return { id: `spec-new-${specRowCounter}`, label, value };
}

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
    specs: [],
    features: "",
    images: [],
    imageFit: "cover",
    isPublished: true,
    isFeatured: false,
    isNew: false,
    hasAudioPreview: false,
  };
}

function productToForm(product: AdminProduct): ProductFormState {
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
    specs: specsToRows(product.specs),
    features: (product.features ?? []).join("\n"),
    images: product.images ?? [],
    imageFit: product.imageFit === "contain" ? "contain" : "cover",
    isPublished: Boolean(product.isPublished),
    isFeatured: Boolean(product.isFeatured),
    isNew: Boolean(product.isNew),
    hasAudioPreview: Boolean(product.hasAudioPreview),
  };
}

function formatInvoiceMoney(value: number) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3
) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) break;
    } else {
      currentLine = candidate;
    }
  }
  if (currentLine && lines.length < maxLines) lines.push(currentLine);

  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });
  return y + lines.length * lineHeight;
}

function createInvoiceImageBlob(
  clientName: string,
  clientId: string,
  clientPhone: string,
  extraDescription: string,
  paymentMethod: string,
  items: InvoiceItem[],
  total: number
): Promise<Blob> {
  const visibleItems = items.filter((item) => item.description.trim());
  const rowHeight = 112;
  const canvas = document.createElement("canvas");
  canvas.width = 1400;
  canvas.height = Math.max(1450, 860 + visibleItems.length * rowHeight + 260);
  const context = canvas.getContext("2d");
  if (!context) return Promise.reject(new Error("No se pudo preparar la imagen."));

  const background = "#121212";
  const card = "#27272A";
  const border = "#3F3F46";
  const accent = "#d47217";
  const white = "#FFFFFF";
  const secondary = "#e3deda";
  const date = new Intl.DateTimeFormat("es-VE", { dateStyle: "long" }).format(
    new Date()
  );

  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = accent;
  context.fillRect(0, 0, canvas.width, 18);
  context.textBaseline = "top";

  context.fillStyle = white;
  context.font = "800 64px Arial, sans-serif";
  context.fillText("ZONA AUDIO", 84, 82);
  context.fillStyle = accent;
  context.font = "700 26px Arial, sans-serif";
  context.fillText("FACTURA / RECIBO DE COMPRA", 86, 164);
  context.fillStyle = secondary;
  context.font = "400 24px Arial, sans-serif";
  context.fillText("Caracas, Venezuela  ·  0414-2868519", 86, 214);
  context.textAlign = "right";
  context.fillText(date, canvas.width - 86, 214);
  context.textAlign = "left";

  context.fillStyle = card;
  context.fillRect(70, 280, canvas.width - 140, 250);
  context.fillStyle = accent;
  context.fillRect(70, 280, 10, 250);
  context.fillStyle = secondary;
  context.font = "700 22px Arial, sans-serif";
  context.fillText("DATOS DEL CLIENTE", 110, 312);
  context.fillStyle = white;
  context.font = "700 36px Arial, sans-serif";
  context.fillText(clientName.trim() || "Cliente por definir", 110, 352);
  context.font = "500 24px Arial, sans-serif";
  context.fillStyle = secondary;
  context.fillText(`Cédula / RIF: ${clientId.trim() || "Por definir"}`, 110, 412);
  context.fillText(`Teléfono: ${clientPhone.trim() || "Por definir"}`, 110, 452);
  if (extraDescription.trim()) {
    wrapCanvasText(context, `Nota: ${extraDescription.trim()}`, 110, 492, 1050, 30, 2);
  }

  const tableLeft = 70;
  const tableWidth = canvas.width - 140;
  const tableTop = 590;
  context.fillStyle = card;
  context.fillRect(tableLeft, tableTop, tableWidth, 76);
  context.fillStyle = accent;
  context.fillRect(tableLeft, tableTop, tableWidth, 8);
  context.fillStyle = secondary;
  context.font = "700 22px Arial, sans-serif";
  context.fillText("CANTIDAD", tableLeft + 34, tableTop + 30);
  context.fillText("PRODUCTO", tableLeft + 190, tableTop + 30);
  context.fillText("PRECIO UNIT.", tableLeft + 800, tableTop + 30);
  context.fillText("TOTAL", tableLeft + 1040, tableTop + 30);

  let rowTop = tableTop + 76;
  context.strokeStyle = border;
  context.lineWidth = 2;
  visibleItems.forEach((item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    context.fillStyle = card;
    context.fillRect(tableLeft, rowTop, tableWidth, rowHeight);
    context.strokeRect(tableLeft, rowTop, tableWidth, rowHeight);
    context.fillStyle = white;
    context.font = "700 28px Arial, sans-serif";
    context.fillText(String(quantity), tableLeft + 34, rowTop + 38);
    context.font = "500 26px Arial, sans-serif";
    wrapCanvasText(context, item.description.trim(), tableLeft + 190, rowTop + 22, 560, 34, 3);
    context.textAlign = "right";
    context.fillText(formatInvoiceMoney(unitPrice), tableLeft + 960, rowTop + 38);
    context.fillStyle = accent;
    context.font = "800 28px Arial, sans-serif";
    context.fillText(formatInvoiceMoney(quantity * unitPrice), tableLeft + tableWidth - 34, rowTop + 38);
    context.textAlign = "left";
    rowTop += rowHeight;
  });

  if (visibleItems.length === 0) {
    context.fillStyle = card;
    context.fillRect(tableLeft, rowTop, tableWidth, rowHeight);
    context.strokeRect(tableLeft, rowTop, tableWidth, rowHeight);
    context.fillStyle = secondary;
    context.font = "500 26px Arial, sans-serif";
    context.fillText("Agrega productos para completar el recibo", tableLeft + 34, rowTop + 38);
    rowTop += rowHeight;
  }

  const totalTop = rowTop + 42;
  context.fillStyle = accent;
  context.fillRect(canvas.width - 590, totalTop, 520, 104);
  context.fillStyle = white;
  context.font = "800 28px Arial, sans-serif";
  context.fillText("TOTAL A PAGAR", canvas.width - 550, totalTop + 22);
  context.font = "800 40px Arial, sans-serif";
  context.textAlign = "right";
  context.fillText(formatInvoiceMoney(total), canvas.width - 110, totalTop + 58);
  context.textAlign = "left";

  context.fillStyle = card;
  context.fillRect(70, totalTop, 650, 104);
  context.fillStyle = secondary;
  context.font = "700 22px Arial, sans-serif";
  context.fillText("MÉTODO DE PAGO", 110, totalTop + 22);
  context.fillStyle = white;
  context.font = "600 30px Arial, sans-serif";
  context.fillText(paymentMethod.trim() || "Por definir", 110, totalTop + 58);

  context.fillStyle = secondary;
  context.font = "400 22px Arial, sans-serif";
  context.textAlign = "center";
  context.fillText("Gracias por tu compra · Zona Audio", canvas.width / 2, canvas.height - 90);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("No se pudo generar la imagen de la factura."));
    }, "image/png");
  });
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
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [invoiceClient, setInvoiceClient] = useState("");
  const [invoiceClientId, setInvoiceClientId] = useState("");
  const [invoiceClientPhone, setInvoiceClientPhone] = useState("");
  const [invoiceExtraDescription, setInvoiceExtraDescription] = useState("");
  const [invoiceMethod, setInvoiceMethod] = useState("");
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: "item-1", description: "", quantity: "1", unitPrice: "" },
  ]);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [invoiceImageUrl, setInvoiceImageUrl] = useState("");
  const [invoiceImagePreview, setInvoiceImagePreview] = useState("");
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [saleId, setSaleId] = useState<string | null>(null);
  const [saleProductId, setSaleProductId] = useState("");
  const [saleQuantity, setSaleQuantity] = useState("1");
  const [saleUnitCost, setSaleUnitCost] = useState("0");
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saleNotes, setSaleNotes] = useState("");
  const [salesPeriod, setSalesPeriod] = useState<"today" | "week" | "all">("today");
  const [isSavingSale, setIsSavingSale] = useState(false);

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
    setSaleProductId((current) => current || payload.products[0]?.id || "");
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

  const loadInvoices = useCallback(async (search = "") => {
    const response = await fetch(
      `/api/admin/invoices${search ? `?search=${encodeURIComponent(search)}` : ""}`,
      { cache: "no-store" }
    );
    if (response.status === 401) {
      router.push("/admin/login");
      return;
    }
    const payload = (await response.json()) as {
      invoices?: SavedInvoice[];
      error?: string;
    };
    if (!response.ok) {
      setStatus({ type: "error", text: payload.error ?? "No se pudieron cargar las facturas." });
      return;
    }
    setSavedInvoices(payload.invoices ?? []);
  }, [router]);

  const loadSales = useCallback(async () => {
    const response = await fetch("/api/admin/sales", { cache: "no-store" });
    if (response.status === 401) {
      router.push("/admin/login");
      return;
    }
    const payload = (await response.json()) as {
      sales?: SaleRecord[];
      error?: string;
    };
    if (!response.ok) {
      setStatus({ type: "error", text: payload.error ?? "No se pudieron cargar las ventas." });
      return;
    }
    setSales(payload.sales ?? []);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCatalog();
      void loadInvoices();
      void loadSales();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadCatalog, loadInvoices, loadSales]);

  const selectedProduct = useMemo(
    () => catalog?.products.find((product) => product.id === form.id),
    [catalog, form.id]
  );

  const invoiceTotal = useMemo(
    () =>
      invoiceItems.reduce((total, item) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        return total + quantity * unitPrice;
      }, 0),
    [invoiceItems]
  );

  const invoiceMarkdown = useMemo(() => {
    const rows = invoiceItems
      .filter((item) => item.description.trim())
      .map((item) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        return `| ${quantity} | ${item.description.trim()} | ${formatInvoiceMoney(unitPrice)} | ${formatInvoiceMoney(quantity * unitPrice)} |`;
      });
    const detailRows = rows.length > 0 ? rows : "| 0 | Producto por definir | $0.00 | $0.00 |";
    const date = new Intl.DateTimeFormat("es-VE", { dateStyle: "long" }).format(
      new Date()
    );

    return [
      "---",
      "**ZONA AUDIO**",
      "📍 Caracas, Venezuela",
      "📞 0414-2868519",
      `🗓️ **Fecha:** ${date}`,
      "",
      "**DATOS DEL CLIENTE:**",
      `👤 **Nombre:** ${invoiceClient.trim() || "Por definir"}`,
      invoiceClientId.trim() ? `🪪 **Cédula / RIF:** ${invoiceClientId.trim()}` : "",
      invoiceClientPhone.trim() ? `📱 **Teléfono:** ${invoiceClientPhone.trim()}` : "",
      invoiceExtraDescription.trim() ? `📝 **Nota:** ${invoiceExtraDescription.trim()}` : "",
      "",
      "**DETALLE DE LA COMPRA:**",
      "",
      "| Cantidad | Producto | Precio Unit. | Total |",
      "| :---: | :--- | :---: | :---: |",
      detailRows,
      "",
      `**TOTAL A PAGAR: ${formatInvoiceMoney(invoiceTotal)}**`,
      "",
      `**MÉTODO DE PAGO:** ${invoiceMethod.trim() || "Por definir"}`,
      "---",
    ].join("\n");
  }, [
    invoiceClient,
    invoiceClientId,
    invoiceClientPhone,
    invoiceExtraDescription,
    invoiceItems,
    invoiceMethod,
    invoiceTotal,
  ]);

  const filteredInvoices = useMemo(() => {
    const query = invoiceSearch.trim().toLowerCase();
    if (!query) return savedInvoices;
    return savedInvoices.filter((invoice) =>
      [
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
        .includes(query)
    );
  }, [invoiceSearch, savedInvoices]);

  const filteredSales = useMemo(() => {
    const today = new Date();
    const todayString = today.toISOString().slice(0, 10);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);
    const weekStartString = weekStart.toISOString().slice(0, 10);
    return sales.filter((sale) => {
      if (salesPeriod === "all") return true;
      if (salesPeriod === "today") return sale.sale_date === todayString;
      return sale.sale_date >= weekStartString && sale.sale_date <= todayString;
    });
  }, [sales, salesPeriod]);

  const financialSummary = useMemo(() => {
    const totalSold = filteredSales.reduce(
      (total, sale) => total + Number(sale.gross_revenue ?? 0),
      0
    );
    const netProfit = filteredSales.reduce(
      (total, sale) => total + Number(sale.net_profit ?? 0),
      0
    );
    return {
      totalSold,
      netProfit,
      margin: totalSold > 0 ? (netProfit / totalSold) * 100 : 0,
    };
  }, [filteredSales]);

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
            specs: rowsToSpecsText(form.specs),
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

  const duplicateProduct = (product: AdminProduct) => {
    const copy = productToForm(product);
    setForm({
      ...copy,
      id: null,
      name: `${product.name} (copia)`,
      isPublished: false,
      isFeatured: false,
      isNew: false,
      // Las filas necesitan ids propios para poder editarse sin colisionar.
      specs: copy.specs.map((row) => createSpecRow(row.label, row.value)),
    });
    setStatus({
      type: "success",
      text: "Producto duplicado en el formulario. Revísalo y guarda.",
    });
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

  const addInvoiceItem = () => {
    setInvoiceItems((current) => [
      ...current,
      { id: crypto.randomUUID(), description: "", quantity: "1", unitPrice: "" },
    ]);
  };

  const updateInvoiceItem = (
    id: string,
    key: keyof Omit<InvoiceItem, "id">,
    value: string
  ) => {
    setInvoiceItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const removeInvoiceItem = (id: string) => {
    setInvoiceItems((current) =>
      current.length > 1
        ? current.filter((item) => item.id !== id)
        : [{ id: "item-1", description: "", quantity: "1", unitPrice: "" }]
    );
  };

  const resetInvoiceForm = () => {
    setInvoiceId(null);
    setInvoiceClient("");
    setInvoiceClientId("");
    setInvoiceClientPhone("");
    setInvoiceExtraDescription("");
    setInvoiceMethod("");
    setInvoiceImageUrl("");
    setInvoiceImagePreview("");
    setInvoiceItems([
      { id: "item-1", description: "", quantity: "1", unitPrice: "" },
    ]);
  };

  const editInvoice = (invoice: SavedInvoice) => {
    setInvoiceId(invoice.id);
    setInvoiceClient(invoice.client_name);
    setInvoiceClientId(invoice.client_id_rif);
    setInvoiceClientPhone(invoice.client_phone);
    setInvoiceExtraDescription(invoice.extra_description);
    setInvoiceMethod(invoice.payment_method);
    setInvoiceImageUrl(invoice.image_url);
    setInvoiceImagePreview(invoice.image_url);
    setInvoiceItems(
      invoice.items.length > 0
        ? invoice.items
        : [{ id: "item-1", description: "", quantity: "1", unitPrice: "" }]
    );
    setInvoiceSearch("");
    setStatus({ type: "success", text: "Factura cargada para editar." });
  };

  const persistInvoice = async (
    imageUrlOverride = invoiceImageUrl
  ): Promise<SavedInvoice | null> => {
    if (!invoiceClient.trim()) {
      setStatus({ type: "error", text: "Escribe el nombre del cliente." });
      return null;
    }
    if (!invoiceItems.some((item) => item.description.trim())) {
      setStatus({ type: "error", text: "Agrega al menos un producto." });
      return null;
    }

    setIsSavingInvoice(true);
    setStatus(null);
    try {
      const response = await fetch(
        invoiceId ? `/api/admin/invoices/${invoiceId}` : "/api/admin/invoices",
        {
          method: invoiceId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName: invoiceClient,
            clientId: invoiceClientId,
            clientPhone: invoiceClientPhone,
            extraDescription: invoiceExtraDescription,
            paymentMethod: invoiceMethod,
            items: invoiceItems,
            markdown: invoiceMarkdown,
            imageUrl: imageUrlOverride,
            status: "Enviada",
          }),
        }
      );
      const saved = (await response.json()) as SavedInvoice & { error?: string };
      if (!response.ok) {
        throw new Error(saved.error ?? "No se pudo guardar la factura.");
      }
      setSavedInvoices((current) =>
        invoiceId
          ? current.map((invoice) => (invoice.id === saved.id ? saved : invoice))
          : [saved, ...current]
      );
      setInvoiceId(saved.id);
      setInvoiceImageUrl(saved.image_url);
      setStatus({ type: "success", text: "Factura guardada en el panel." });
      return saved;
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo guardar la factura.",
      });
      return null;
    } finally {
      setIsSavingInvoice(false);
    }
  };

  const deleteInvoice = async (invoice: SavedInvoice) => {
    if (!window.confirm(`¿Eliminar la factura de ${invoice.client_name}?`)) return;
    const response = await fetch(`/api/admin/invoices/${invoice.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setStatus({ type: "error", text: "No se pudo eliminar la factura." });
      return;
    }
    setSavedInvoices((current) =>
      current.filter((item) => item.id !== invoice.id)
    );
    if (invoice.id === invoiceId) resetInvoiceForm();
    setStatus({ type: "success", text: "Factura eliminada." });
  };

  const resetSaleForm = () => {
    setSaleId(null);
    setSaleQuantity("1");
    setSaleUnitCost("0");
    setSaleDate(new Date().toISOString().slice(0, 10));
    setSaleNotes("");
    setSaleProductId(catalog?.products[0]?.id ?? "");
  };

  const editSale = (sale: SaleRecord) => {
    setSaleId(sale.id);
    setSaleProductId(sale.product_id);
    setSaleQuantity(String(sale.quantity));
    setSaleUnitCost(String(sale.unit_cost));
    setSaleDate(sale.sale_date);
    setSaleNotes(sale.notes);
  };

  const saveSale = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!saleProductId) {
      setStatus({ type: "error", text: "Selecciona un producto." });
      return;
    }
    setIsSavingSale(true);
    setStatus(null);
    try {
      const response = await fetch(saleId ? `/api/admin/sales/${saleId}` : "/api/admin/sales", {
        method: saleId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: saleProductId,
          quantity: saleQuantity,
          unitCost: saleUnitCost,
          saleDate,
          notes: saleNotes,
        }),
      });
      const payload = (await response.json()) as SaleRecord & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "No se pudo guardar la venta.");
      await loadSales();
      resetSaleForm();
      setStatus({ type: "success", text: "Venta registrada correctamente." });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo guardar la venta.",
      });
    } finally {
      setIsSavingSale(false);
    }
  };

  const deleteSale = async (sale: SaleRecord) => {
    if (!window.confirm(`¿Eliminar la venta de ${sale.product_name}?`)) return;
    const response = await fetch(`/api/admin/sales/${sale.id}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus({ type: "error", text: "No se pudo eliminar la venta." });
      return;
    }
    await loadSales();
    if (sale.id === saleId) resetSaleForm();
    setStatus({ type: "success", text: "Venta eliminada." });
  };

  const downloadInvoiceImage = async () => {
    setStatus(null);
    setIsPreparingImage(true);
    try {
      const blob = await createInvoiceImageBlob(
        invoiceClient,
        invoiceClientId,
        invoiceClientPhone,
        invoiceExtraDescription,
        invoiceMethod,
        invoiceItems,
        invoiceTotal
      );
      const file = new File([blob], `factura-zona-audio-${Date.now()}.png`, {
        type: "image/png",
      });
      const previewUrl = URL.createObjectURL(blob);
      setInvoiceImagePreview(previewUrl);

      const uploadBody = new FormData();
      uploadBody.append("file", file);
      const uploadResponse = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadBody,
      });
      const uploadPayload = (await uploadResponse.json()) as {
        url?: string;
        error?: string;
      };
      if (!uploadResponse.ok || !uploadPayload.url) {
        throw new Error(uploadPayload.error ?? "No se pudo guardar la imagen.");
      }

      setInvoiceImageUrl(uploadPayload.url);
      const saved = await persistInvoice(uploadPayload.url);
      if (!saved) return;

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.name;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      setStatus({
        type: "success",
        text: "Imagen descargada y factura guardada en el panel.",
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo generar la imagen.",
      });
    } finally {
      setIsPreparingImage(false);
    }
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
            ["invoices", "Facturación", FileText],
            ["finance", "Finanzas", Calculator],
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
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${product.isPublished ? "bg-[#d47217] text-white" : "border border-[#52525B] text-[#e3deda]"}`}>
                            {product.isPublished ? "En la web" : "Borrador"}
                          </span>
                          {product.isFeatured && (
                            <span className="rounded-md border border-[#52525B] px-2 py-0.5 text-[10px] font-bold text-[#e3deda]">
                              Destacado
                            </span>
                          )}
                          {product.isNew && (
                            <span className="rounded-md border border-[#52525B] px-2 py-0.5 text-[10px] font-bold text-[#e3deda]">
                              Novedad
                            </span>
                          )}
                          <span className="rounded-md border border-[#52525B] px-2 py-0.5 text-[10px] font-bold text-[#e3deda]">
                            {Object.keys(product.specs ?? {}).length} especif.
                          </span>
                          <span className="rounded-md border border-[#52525B] px-2 py-0.5 text-[10px] font-bold text-[#e3deda]">
                            {product.images.length} imagen{product.images.length === 1 ? "" : "es"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setForm(productToForm(product))} className={secondaryButton}>
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                      <button type="button" onClick={() => duplicateProduct(product)} className={secondaryButton}>
                        <Boxes className="h-3.5 w-3.5" /> Duplicar
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
                <ProductPreviewCard
                  name={form.name}
                  price={Number(form.price) || 0}
                  originalPrice={Number(form.originalPrice) || 0}
                  stock={Number(form.stock) || 0}
                  description={form.description}
                  specs={form.specs}
                  image={form.images[0] ?? ""}
                  imageFit={form.imageFit}
                  hasAudioPreview={form.hasAudioPreview}
                  isPublished={form.isPublished}
                />
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={labelClass}>Especificaciones de fábrica</span>
                    <button
                      type="button"
                      onClick={() => updateForm("specs", [...form.specs, createSpecRow()])}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#52525B] px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:border-[#d47217]"
                    >
                      <Plus className="h-3 w-3" /> Agregar fila
                    </button>
                  </div>
                  {form.specs.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-[#52525B] px-3 py-4 text-center text-[11px] text-[#e3deda]">
                      Todavía no hay especificaciones. Agrégalas para que aparezcan en la web.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {form.specs.map((row, index) => (
                        <div key={row.id} className="grid gap-2 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_auto]">
                          <input
                            className={inputClass}
                            value={row.label}
                            onChange={(e) =>
                              updateForm(
                                "specs",
                                form.specs.map((item) =>
                                  item.id === row.id ? { ...item, label: e.target.value } : item
                                )
                              )
                            }
                            placeholder="Tipo de micrófono"
                            aria-label={`Especificación ${index + 1}: nombre`}
                          />
                          <input
                            className={inputClass}
                            value={row.value}
                            onChange={(e) =>
                              updateForm(
                                "specs",
                                form.specs.map((item) =>
                                  item.id === row.id ? { ...item, value: e.target.value } : item
                                )
                              )
                            }
                            placeholder="Dinámico unidireccional"
                            aria-label={`Especificación ${index + 1}: valor`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateForm(
                                "specs",
                                form.specs.filter((item) => item.id !== row.id)
                              )
                            }
                            className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-red-400/30 text-red-200 transition hover:bg-red-400/10"
                            aria-label={`Quitar especificación ${index + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-[#e3deda]">
                    La columna izquierda es el nombre y la derecha el valor. Se muestran en la tabla
                    de la ficha del producto.
                  </p>
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

        {activeTab === "invoices" && (
          <section className="space-y-5">
            <div className="rounded-3xl border border-[#3F3F46] bg-[#27272A] p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-[#d47217]/15 p-2 text-[#d47217]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black">Facturación rápida</h2>
                  <p className="mt-1 text-xs text-[#e3deda]">
                    Genera recibos Markdown sin IVA, IGTF ni impuestos adicionales.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <div className="rounded-3xl border border-[#3F3F46] bg-[#27272A] p-5">
                <h3 className="text-sm font-black">Datos del recibo</h3>
                <div className="mt-4 space-y-4">
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="invoice-client">Nombre del cliente</label>
                    <input id="invoice-client" className={inputClass} value={invoiceClient} onChange={(event) => setInvoiceClient(event.target.value)} placeholder="Ej.: Juan Pérez" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="invoice-client-id">Cédula o RIF del cliente</label>
                    <input id="invoice-client-id" className={inputClass} value={invoiceClientId} onChange={(event) => setInvoiceClientId(event.target.value)} placeholder="Ej.: V-12345678" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="invoice-client-phone">Número de teléfono</label>
                    <input id="invoice-client-phone" className={inputClass} value={invoiceClientPhone} onChange={(event) => setInvoiceClientPhone(event.target.value)} placeholder="Ej.: 0414-1234567" inputMode="tel" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="invoice-extra-description">Descripción adicional</label>
                    <textarea id="invoice-extra-description" rows={3} className={inputClass} value={invoiceExtraDescription} onChange={(event) => setInvoiceExtraDescription(event.target.value)} placeholder="Ej.: Entrega en Caracas, nota de la orden, acordiones..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="invoice-method">Método de pago</label>
                    <input id="invoice-method" className={inputClass} value={invoiceMethod} onChange={(event) => setInvoiceMethod(event.target.value)} placeholder="Ej.: Zelle, efectivo o pago móvil" />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-[#3F3F46] bg-[#27272A] p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black">Detalle de la compra</h3>
                  <button type="button" onClick={addInvoiceItem} className={secondaryButton}>
                    <Plus className="h-4 w-4" /> Añadir producto
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {invoiceItems.map((item) => (
                    <div key={item.id} className="grid gap-2 rounded-2xl border border-[#3F3F46] bg-[#121212] p-3 sm:grid-cols-[1fr_90px_120px_36px] sm:items-end">
                      <div className="space-y-1.5">
                        <label className={labelClass}>Producto</label>
                        <input className={inputClass} value={item.description} onChange={(event) => updateInvoiceItem(item.id, "description", event.target.value)} placeholder="Ej.: Micrófonos inalámbricos" />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Cant.</label>
                        <input type="number" min="1" step="1" className={inputClass} value={item.quantity} onChange={(event) => updateInvoiceItem(item.id, "quantity", event.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Precio unit.</label>
                        <input type="number" min="0" step="0.01" className={inputClass} value={item.unitPrice} onChange={(event) => updateInvoiceItem(item.id, "unitPrice", event.target.value)} placeholder="0.00" />
                      </div>
                      <button type="button" onClick={() => removeInvoiceItem(item.id)} className="mb-1 rounded-lg p-2 text-red-200 transition hover:bg-red-400/10" aria-label="Eliminar producto del recibo">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#3F3F46] pt-4 text-sm">
                  <span className="text-[#e3deda]">Total a pagar</span>
                  <strong className="font-mono text-lg text-[#d47217]">{formatInvoiceMoney(invoiceTotal)}</strong>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#3F3F46] bg-[#27272A] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-black">Recibo generado</h3>
                  <p className="mt-1 text-xs text-[#e3deda]">Revisa el texto antes de enviarlo.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={downloadInvoiceImage}
                    disabled={isPreparingImage}
                    className={primaryButton}
                  >
                    <Download className="h-4 w-4" />
                    {isPreparingImage ? "Preparando imagen..." : "Descargar imagen"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void persistInvoice()}
                    disabled={isSavingInvoice || isPreparingImage}
                    className={secondaryButton}
                  >
                    <Save className="h-4 w-4" />
                    {isSavingInvoice ? "Guardando..." : invoiceId ? "Actualizar factura" : "Guardar factura"}
                  </button>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-[#3F3F46] bg-[#121212] px-4 py-3 text-xs text-[#e3deda]">
                La imagen se descarga para que puedas enviarla manualmente al cliente. La factura también queda guardada en el panel.
              </div>
              {invoiceImagePreview && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-[#3F3F46] bg-[#121212] p-3">
                  <div
                    className="mx-auto aspect-[1400/1000] w-full max-w-2xl bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url("${invoiceImagePreview}")` }}
                    role="img"
                    aria-label="Vista previa de la factura"
                  />
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-[#3F3F46] bg-[#27272A] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-black">Facturas guardadas ({savedInvoices.length})</h3>
                  <p className="mt-1 text-xs text-[#e3deda]">Busca, edita o elimina recibos enviados.</p>
                </div>
                <button type="button" onClick={resetInvoiceForm} className={secondaryButton}>
                  <Plus className="h-4 w-4" /> Nueva factura
                </button>
              </div>
              <div className="relative mt-4">
                <FileText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#e3deda]" />
                <input
                  className={`${inputClass} pl-10`}
                  value={invoiceSearch}
                  onChange={(event) => {
                    setInvoiceSearch(event.target.value);
                    void loadInvoices(event.target.value);
                  }}
                  placeholder="Buscar por cliente, teléfono, método o producto"
                />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {filteredInvoices.map((invoice) => (
                  <article key={invoice.id} className="rounded-2xl border border-[#3F3F46] bg-[#121212] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-white">{invoice.client_name}</p>
                        <p className="mt-1 text-xs text-[#e3deda]">
                          {invoice.payment_method} · {invoice.status}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-sm font-black text-[#d47217]">
                        {formatInvoiceMoney(invoice.total)}
                      </span>
                    </div>
                    <p className="mt-2 truncate text-[11px] text-[#e3deda]">
                      {invoice.items.map((item) => `${item.quantity} × ${item.description}`).join(" · ")}
                    </p>
                    <p className="mt-1 text-[10px] text-[#8e837e]">
                      {invoice.client_id_rif || "Sin cédula/RIF"} · {invoice.client_phone || "Sin teléfono"}
                    </p>
                    {invoice.extra_description && (
                      <p className="mt-1 line-clamp-2 text-[10px] text-[#e3deda]">{invoice.extra_description}</p>
                    )}
                    <p className="mt-1 text-[10px] text-[#8e837e]">
                      {invoice.created_at
                        ? new Date(invoice.created_at).toLocaleString("es-VE")
                        : "Sin fecha"}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => editInvoice(invoice)} className={secondaryButton}>
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                      <button type="button" onClick={() => void deleteInvoice(invoice)} className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 px-3 py-2 text-xs font-bold text-red-200 transition hover:bg-red-400/10">
                        <Trash2 className="h-3.5 w-3.5" /> Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {filteredInvoices.length === 0 && (
                <p className="mt-4 rounded-xl border border-dashed border-[#52525B] px-4 py-6 text-center text-xs text-[#e3deda]">
                  No se encontraron facturas guardadas.
                </p>
              )}
            </div>
          </section>
        )}

        {activeTab === "finance" && (
          <section className="space-y-5">
            <div className="rounded-3xl border border-[#3F3F46] bg-[#27272A] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-black">Control de ventas y ganancias</h3>
                  <p className="mt-1 text-xs text-[#e3deda]">
                    El precio de venta se toma del precio publicado en la página web.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["today", "Hoy"],
                      ["week", "Últimos 7 días"],
                      ["all", "Todo"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSalesPeriod(value)}
                      className={salesPeriod === value ? primaryButton : secondaryButton}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-[#3F3F46] bg-[#121212] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#e3deda]">
                    Total vendido
                  </p>
                  <p className="mt-2 font-mono text-2xl font-black text-white">
                    {formatInvoiceMoney(financialSummary.totalSold)}
                  </p>
                  <p className="mt-1 text-[10px] text-[#8e837e]">Ingreso bruto del periodo</p>
                </div>
                <div className="rounded-2xl border border-[#3F3F46] bg-[#121212] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#e3deda]">
                    Ganancia neta total
                  </p>
                  <p className="mt-2 font-mono text-2xl font-black text-[#d47217]">
                    {formatInvoiceMoney(financialSummary.netProfit)}
                  </p>
                  <p className="mt-1 text-[10px] text-[#8e837e]">Ingreso bruto menos los costos</p>
                </div>
                <div className="rounded-2xl border border-[#3F3F46] bg-[#121212] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#e3deda]">
                    Margen de rentabilidad
                  </p>
                  <p className="mt-2 font-mono text-2xl font-black text-white">
                    {financialSummary.margin.toLocaleString("es-VE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    %
                  </p>
                  <p className="mt-1 text-[10px] text-[#8e837e]">Ganancia neta sobre el total vendido</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#3F3F46] bg-[#27272A] p-5">
              <h3 className="text-sm font-black">
                {saleId ? "Editar venta" : "Registrar venta"}
              </h3>
              <form onSubmit={saveSale} className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className={labelClass} htmlFor="sale-product">
                    Producto
                  </label>
                  <select
                    id="sale-product"
                    className={inputClass}
                    value={saleProductId}
                    onChange={(event) => setSaleProductId(event.target.value)}
                    required
                  >
                    <option value="">Selecciona un producto</option>
                    {(catalog?.products ?? []).map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} · {formatInvoiceMoney(Number(product.price ?? 0))}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="sale-quantity">
                    Cantidad vendida
                  </label>
                  <input
                    id="sale-quantity"
                    className={inputClass}
                    value={saleQuantity}
                    onChange={(event) => setSaleQuantity(event.target.value)}
                    inputMode="decimal"
                    min="1"
                    step="1"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="sale-unit-cost">
                    Costo unitario (lo que te costó a ti)
                  </label>
                  <input
                    id="sale-unit-cost"
                    className={inputClass}
                    value={saleUnitCost}
                    onChange={(event) => setSaleUnitCost(event.target.value)}
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="sale-date">
                    Fecha de la venta
                  </label>
                  <input
                    id="sale-date"
                    type="date"
                    className={inputClass}
                    value={saleDate}
                    onChange={(event) => setSaleDate(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="sale-notes">
                    Nota
                  </label>
                  <input
                    id="sale-notes"
                    className={inputClass}
                    value={saleNotes}
                    onChange={(event) => setSaleNotes(event.target.value)}
                    placeholder="Ej.: pago por Binance"
                  />
                </div>
                <div className="md:col-span-2 flex flex-wrap gap-2">
                  <button type="submit" className={primaryButton} disabled={isSavingSale}>
                    <Save className="h-4 w-4" />
                    {isSavingSale ? "Guardando..." : saleId ? "Actualizar venta" : "Registrar venta"}
                  </button>
                  {saleId && (
                    <button type="button" onClick={resetSaleForm} className={secondaryButton}>
                      Cancelar edición
                    </button>
                  )}
                </div>
              </form>
              <div className="mt-4 rounded-2xl border border-[#3F3F46] bg-[#121212] px-4 py-3 text-xs text-[#e3deda]">
                Registra cada venta con su costo real. El panel calcula el ingreso bruto, la ganancia
                neta y el margen de rentabilidad usando el precio publicado en la web.
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-[#3F3F46] bg-[#27272A]">
              <div className="px-5 pt-5">
                <h3 className="text-sm font-black">Registro de ventas ({filteredSales.length})</h3>
                <p className="mt-1 text-xs text-[#e3deda]">
                  Reportes guardados del periodo seleccionado.
                </p>
              </div>
              {filteredSales.length === 0 ? (
                <p className="m-5 rounded-xl border border-dashed border-[#52525B] px-4 py-6 text-center text-xs text-[#e3deda]">
                  Todavía no hay ventas registradas en este periodo.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left text-xs">
                    <thead className="bg-[#121212] text-[10px] uppercase tracking-wide text-[#e3deda]">
                      <tr>
                        <th className="px-5 py-3 font-bold">Producto</th>
                        <th className="px-3 py-3 font-bold">Cantidad</th>
                        <th className="px-3 py-3 font-bold">Costo unitario</th>
                        <th className="px-3 py-3 font-bold">Precio de venta</th>
                        <th className="px-3 py-3 font-bold">Ingreso bruto</th>
                        <th className="px-3 py-3 font-bold">Ganancia neta</th>
                        <th className="px-3 py-3 font-bold">Fecha</th>
                        <th className="px-5 py-3 font-bold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSales.map((sale) => (
                        <tr
                          key={sale.id}
                          className="border-t border-[#3F3F46] align-top text-white"
                        >
                          <td className="px-5 py-3">
                            <p className="font-bold">{sale.product_name}</p>
                            {sale.notes && (
                              <p className="mt-0.5 text-[10px] text-[#e3deda]">{sale.notes}</p>
                            )}
                          </td>
                          <td className="px-3 py-3 font-mono">{sale.quantity}</td>
                          <td className="px-3 py-3 font-mono">
                            {formatInvoiceMoney(Number(sale.unit_cost))}
                          </td>
                          <td className="px-3 py-3 font-mono">
                            {formatInvoiceMoney(Number(sale.unit_price))}
                          </td>
                          <td className="px-3 py-3 font-mono text-white">
                            {formatInvoiceMoney(Number(sale.gross_revenue))}
                          </td>
                          <td className="px-3 py-3 font-mono font-bold text-[#d47217]">
                            {formatInvoiceMoney(Number(sale.net_profit))}
                          </td>
                          <td className="px-3 py-3 font-mono text-[#e3deda]">{sale.sale_date}</td>
                          <td className="px-5 py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => editSale(sale)}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#52525B] px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:border-[#d47217]"
                              >
                                <Pencil className="h-3 w-3" /> Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => void deleteSale(sale)}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-400/30 px-2.5 py-1.5 text-[11px] font-bold text-red-200 transition hover:bg-red-400/10"
                              >
                                <Trash2 className="h-3 w-3" /> Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[#121212]">
                      <tr className="text-white">
                        <td className="px-5 py-3 font-black" colSpan={4}>
                          Totales del periodo
                        </td>
                        <td className="px-3 py-3 font-mono font-black">
                          {formatInvoiceMoney(financialSummary.totalSold)}
                        </td>
                        <td className="px-3 py-3 font-mono font-black text-[#d47217]">
                          {formatInvoiceMoney(financialSummary.netProfit)}
                        </td>
                        <td className="px-3 py-3" colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};
