import type { Product } from "@/data/products";

export type ProductCurrency = "USD" | "VES";

export function formatMoney(
  amount: number,
  currency: ProductCurrency = "USD",
  options?: Intl.NumberFormatOptions
): string {
  const formattedAmount = amount.toLocaleString("es-VE", options);
  return currency === "VES"
    ? `Bs. ${formattedAmount}`
    : `$${formattedAmount}`;
}

export function formatProductPrice(
  product: Pick<Product, "price">,
  amount = product.price,
  options?: Intl.NumberFormatOptions
): string {
  return formatMoney(amount, "USD", options);
}
