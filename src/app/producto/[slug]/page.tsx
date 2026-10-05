import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getPublicCatalog } from "@/lib/catalog";
import { productPath } from "@/lib/productSlug";
import { BcvRateProvider } from "@/components/BcvRateProvider";
import { ProductActions } from "@/components/ProductActions";
import { ProductGallery } from "@/components/ProductGallery";
import { VariantPicker } from "@/components/VariantPicker";
import { ContactBlock } from "@/components/ContactBlock";

const SITIO = "https://zonaaudio.com";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { products } = await getPublicCatalog();
  return products.map((product) => ({
    slug: productPath(product).replace("/producto/", ""),
  }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado | Zona Audio" };

  const titulo = `${product.name} | Zona Audio Caracas`;
  const descripcion =
    product.description?.slice(0, 155) ||
    `${product.name} en Zona Audio. ${product.brand}.`;

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: productPath(product) },
    openGraph: {
      type: "website",
      locale: "es_VE",
      url: `${SITIO}${productPath(product)}`,
      title: titulo,
      description: descripcion,
      images: product.images?.[0] ? [{ url: product.images[0], alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function PaginaProducto({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const specs = Object.entries(product.specs ?? {}).filter(
    ([, valor]) => valor && String(valor).trim()
  );
  const agotado = (product.stock ?? 0) <= 0;

  const datos = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: (product.images ?? []).map((img) =>
      img.startsWith("http") ? img : `${SITIO}${img}`
    ),
    sku: product.id,
    brand: { "@type": "Brand", name: product.brand },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: `${SITIO}${productPath(product)}`,
      priceCurrency: "USD",
      price: Number(product.price ?? 0).toFixed(2),
      availability: agotado
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Zona Audio" },
    },
    ...(product.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(product.rating).toFixed(1),
            reviewCount: product.reviewCount ?? 0,
          },
        }
      : {}),
  };

  return (
    <BcvRateProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datos) }}
      />
      <div className="min-h-screen bg-[#121212] text-[#FFFFFF]">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
          <nav aria-label="Migas de pan" className="mb-6 text-xs text-[#e3deda]">
            <Link href="/" className="hover:text-[#d47217]">
              Inicio
            </Link>
            <span className="mx-2">/</span>
            <span>{product.category}</span>
            <span className="mx-2">/</span>
            <span className="text-white">{product.name}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-2">
            <ProductGallery
              images={product.images ?? []}
              alt={product.name}
              imageFit={product.imageFit}
              agotado={agotado}
            />

            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#d47217]">
                  {product.brand}
                  {product.subcategory ? ` • ${product.subcategory}` : ""}
                </p>
                <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
                  {product.name}
                </h1>
                {product.rating ? (
                  <p className="mt-2 flex items-center gap-2 text-sm text-[#e3deda]">
                    <span className="font-bold text-[#d47217]">
                      ★ {Number(product.rating).toFixed(1)}
                    </span>
                    <span>({product.reviewCount ?? 0} reseñas)</span>
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <span className="font-mono text-4xl font-black text-[#d47217]">
                  ${Number(product.price ?? 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                {product.originalPrice ? (
                  <span className="font-mono text-lg text-[#e3deda] line-through">
                    $
                    {Number(product.originalPrice).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-[#e3deda]">
                Precio en dólares. El monto en bolívares se calcula con la tasa BCV del
                día al momento del pago.
              </p>

              <p className="text-sm leading-relaxed text-[#e3deda]">
                {product.description}
              </p>

              {product.variants && product.variants.length > 0 ? (
                <VariantPicker product={product} />
              ) : (
                <ProductActions product={product} />
              )}

              {specs.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#e3deda]">
                    Especificaciones de fábrica
                  </h2>
                  <div className="overflow-hidden rounded-xl border border-[#52525B] bg-[#27272A] text-sm">
                    {specs.map(([clave, valor]) => (
                      <div
                        key={clave}
                        className="grid grid-cols-[minmax(0,38%)_minmax(0,1fr)] gap-3 border-b border-[#3F3F46] px-3 py-2.5 last:border-b-0"
                      >
                        <span className="font-semibold text-[#e3deda]">
                          {clave}:
                        </span>
                        <span className="whitespace-pre-line text-white">
                          {String(valor)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.features && product.features.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#e3deda]">
                    Características
                  </h2>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-[#e3deda]">
                    {product.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <ContactBlock />

          <OtrosProductos actual={product.id} />
        </div>
      </div>
    </BcvRateProvider>
  );
}

async function OtrosProductos({ actual }: { actual: string }) {
  const { products } = await getPublicCatalog();
  const otros = products.filter((p) => p.id !== actual).slice(0, 4);
  if (otros.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-lg font-black">También te puede interesar</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {otros.map((p) => (
          <Link
            key={p.id}
            href={productPath(p)}
            className="group rounded-2xl border border-[#3F3F46] bg-[#27272A] p-3 transition hover:border-[#d47217]"
          >
            <div
              className={`relative aspect-square overflow-hidden rounded-xl ${
                p.imageFit === "contain" ? "bg-[#E5E7EB]" : "bg-[#121212]"
              }`}
            >
              {p.images?.[0] ? (
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className={p.imageFit === "contain" ? "object-contain p-2" : "object-cover"}
                />
              ) : null}
            </div>
            <p className="mt-2 line-clamp-2 text-xs font-bold group-hover:text-[#d47217]">
              {p.name}
            </p>
            <p className="mt-1 font-mono text-sm font-black text-[#d47217]">
              ${Number(p.price ?? 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}