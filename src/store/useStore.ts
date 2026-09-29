import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products, Product } from "@/data/products";
import { audioEngine } from "@/utils/audioEngine";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  couponCode: string;
  discountRate: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getShipping: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      couponCode: "",
      discountRate: 0,
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((item) => item.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              isCartOpen: true,
            };
          }
          return {
            items: [...state.items, { product, quantity }],
            isCartOpen: true,
          };
        });
      },
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },
      applyCoupon: (code: string) => {
        const cleanCode = code.trim().toUpperCase();
        if (cleanCode === "AURAVIP2026" || cleanCode === "AURA15" || cleanCode === "GONZALEZ2026") {
          set({ couponCode: cleanCode, discountRate: 0.15 });
          return {
            success: true,
            message: "¡Se aplicó correctamente el descuento de Zona Audio del 15 %!",
          };
        } else if (cleanCode === "AURAVIP" || cleanCode === "VIP20") {
          set({ couponCode: cleanCode, discountRate: 0.20 });
          return {
            success: true,
            message: "¡Se aplicó el descuento exclusivo de Zona Audio del 20 %!",
          };
        } else if (cleanCode === "AURASHIP" || cleanCode === "FREESHIP") {
          set({ couponCode: cleanCode, discountRate: 0.05 });
          return {
            success: true,
            message: "¡Se activaron el envío exprés gratis y el cupón del 5 %!",
          };
        }
        return {
          success: false,
          message: "Código promocional no válido. Prueba con AURAVIP2026",
        };
      },
      removeCoupon: () => set({ couponCode: "", discountRate: 0 }),
      clearCart: () => set({ items: [], couponCode: "", discountRate: 0 }),
      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },
      getDiscount: () => {
        const subtotal = get().getSubtotal();
        return subtotal * get().discountRate;
      },
      getShipping: () => {
        const state = get();
        const subtotal = state.getSubtotal();
        if (subtotal === 0) return 0;
        if (
          state.items.some((item) => item.product.freeShipping) ||
          subtotal >= 150 ||
          state.couponCode === "AURASHIP" ||
          state.couponCode === "FREESHIP"
        ) {
          return 0;
        }
        return 14.99;
      },
      getTotal: () => {
        const state = get();
        const subtotal = state.getSubtotal();
        const discount = state.getDiscount();
        const shipping = state.getShipping();
        return Math.max(0, subtotal - discount + shipping);
      },
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "aura_vip_cart",
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        discountRate: state.discountRate,
      }),
      merge: (persistedState, currentState) => {
        const state = persistedState as Partial<CartStore>;
        return {
          ...currentState,
          ...state,
          items: (state.items ?? []).map((item) => {
            const currentProduct = products.find(
              (product) => product.id === item.product.id
            );
            return currentProduct ? { ...item, product: currentProduct } : item;
          }),
        };
      },
    }
  )
);

// Wishlist Store
interface WishlistStore {
  items: Product[];
  isWishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlistDrawer: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeItem: (productId: string) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isWishlistOpen: false,
      openWishlist: () => set({ isWishlistOpen: true }),
      closeWishlist: () => set({ isWishlistOpen: false }),
      toggleWishlistDrawer: () => set((state) => ({ isWishlistOpen: !state.isWishlistOpen })),
      toggleWishlist: (product: Product) => {
        const exists = get().items.some((item) => item.id === product.id);
        if (exists) {
          set((state) => ({
            items: state.items.filter((item) => item.id !== product.id),
          }));
        } else {
          set((state) => ({
            items: [...state.items, product],
          }));
        }
      },
      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },
    }),
    {
      name: "aura_vip_wishlist",
      partialize: (state) => ({ items: state.items }),
      merge: (persistedState, currentState) => {
        const state = persistedState as Partial<WishlistStore>;
        return {
          ...currentState,
          ...state,
          items: (state.items ?? []).map((product) => {
            const currentProduct = products.find((item) => item.id === product.id);
            return currentProduct ?? product;
          }),
        };
      },
    }
  )
);

// Audio Player Store
interface PlayerStore {
  currentProduct: Product | null;
  isPlaying: boolean;
  progress: number;
  playSample: (product: Product) => void;
  stopSample: () => void;
  toggleSample: (product: Product) => void;
}

let progressInterval: NodeJS.Timeout | null = null;

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentProduct: null,
  isPlaying: false,
  progress: 0,
  playSample: (product: Product) => {
    if (progressInterval) clearInterval(progressInterval);

    set({ currentProduct: product, isPlaying: true, progress: 0 });

    if (typeof window !== "undefined" && audioEngine) {
      audioEngine.playSample(product.soundDemo.type, product.soundDemo.duration, () => {
        set({ isPlaying: false, progress: 100 });
        if (progressInterval) clearInterval(progressInterval);
      });
    }

    const durationMs = (product.soundDemo.duration || 5) * 1000;
    const intervalMs = 100;
    let elapsed = 0;

    progressInterval = setInterval(() => {
      elapsed += intervalMs;
      const currentPct = Math.min(100, (elapsed / durationMs) * 100);
      set({ progress: currentPct });
      if (elapsed >= durationMs) {
        if (progressInterval) clearInterval(progressInterval);
        set({ isPlaying: false });
      }
    }, intervalMs);
  },
  stopSample: () => {
    if (progressInterval) clearInterval(progressInterval);
    if (typeof window !== "undefined" && audioEngine) {
      audioEngine.stop();
    }
    set({ isPlaying: false, progress: 0 });
  },
  toggleSample: (product: Product) => {
    const { currentProduct, isPlaying, playSample, stopSample } = get();
    if (isPlaying && currentProduct?.id === product.id) {
      stopSample();
    } else {
      playSample(product);
    }
  },
}));

// Theme Store (Dark mode priority, toggleable to light mode)
interface ThemeStore {
  theme: "dark" | "light";
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "dark",
      toggleTheme: () => {
        const newTheme = get().theme === "dark" ? "light" : "dark";
        set({ theme: newTheme });
        if (typeof document !== "undefined") {
          if (newTheme === "light") {
            document.documentElement.classList.add("light-theme");
          } else {
            document.documentElement.classList.remove("light-theme");
          }
        }
      },
    }),
    {
      name: "aura_vip_theme",
    }
  )
);
