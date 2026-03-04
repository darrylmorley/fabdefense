"use client";
import { captureClientError } from "@/lib/clientError";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Cart } from "@/types";

const CART_SESSION_KEY = "cart_session_token";
const CART_CACHE_KEY = "cart_cache";
const CART_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const DELIVERY_LIGHTSPEED_IDS = [7476, 8403, 8461];

function isDeliveryItem(lightspeedID: number | null): boolean {
  return (
    lightspeedID !== null && DELIVERY_LIGHTSPEED_IDS.includes(lightspeedID)
  );
}

// Session token helpers (exported so components can call them directly)
export function getSessionToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(CART_SESSION_KEY) || "";
}

export function ensureSessionToken(): string {
  let token = getSessionToken();
  if (!token) {
    token = `session_${crypto.randomUUID()}`;
    localStorage.setItem(CART_SESSION_KEY, token);
  }
  return token;
}

function clearSessionToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CART_SESSION_KEY);
  }
}

function clearCartCache(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CART_CACHE_KEY);
  }
}

function getCachedCart(): Cart | null {
  if (typeof window === "undefined") return null;
  const cached = localStorage.getItem(CART_CACHE_KEY);
  if (!cached) return null;
  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CART_CACHE_TTL) {
      return data;
    }
  } catch (error) {
    captureClientError("Error parsing cached cart:", error);
  }
  localStorage.removeItem(CART_CACHE_KEY);
  return null;
}

function setCachedCart(cart: Cart | null): void {
  if (typeof window === "undefined") return;
  if (cart) {
    localStorage.setItem(
      CART_CACHE_KEY,
      JSON.stringify({ data: cart, timestamp: Date.now() }),
    );
  } else {
    localStorage.removeItem(CART_CACHE_KEY);
  }
}

interface DeliveryEstimate {
  name: string;
  price: number;
  postcode: string;
}

interface CartContextValue {
  cart: Cart | null;
  isCartLoading: boolean;
  isCartOpen: boolean;
  cartItemCount: number;
  cartTotal: number;
  deliveryEstimate: DeliveryEstimate | null;
  isDeliveryEstimating: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateCartItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  estimateDelivery: (postcode: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] =
    useState<DeliveryEstimate | null>(null);
  const [isDeliveryEstimating, setIsDeliveryEstimating] = useState(false);

  const cartItemCount = cart
    ? cart.cartItems
        .filter((item) => !isDeliveryItem(item.lightspeedID))
        .reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const cartTotal = cart
    ? cart.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  const fetchCart = useCallback(async (): Promise<void> => {
    const token = getSessionToken();
    if (!token) return;

    const cachedCart = getCachedCart();
    if (cachedCart) {
      setCart(cachedCart);
      return;
    }

    setIsCartLoading(true);
    try {
      const response = await fetch("/api/cart", {
        headers: { "x-session-token": token },
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data);
        setCachedCart(data);
      } else if (response.status === 404) {
        setCart(null);
        setCachedCart(null);
      }
    } catch (error) {
      captureClientError("Error fetching cart:", error);
    } finally {
      setIsCartLoading(false);
    }
  }, []);

  const addToCart = useCallback(
    async (productId: number, quantity = 1): Promise<void> => {
      const token = ensureSessionToken();
      setIsCartLoading(true);
      try {
        const response = await fetch("/api/cart/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-token": token,
          },
          body: JSON.stringify({ productId, quantity }),
        });
        if (response.ok) {
          clearCartCache();
          await fetchCart();
          setIsCartOpen(true);
        } else {
          const error = await response.json();
          throw new Error(error.details || error.error || "Failed to add item");
        }
      } catch (error) {
        captureClientError("Error adding to cart:", error);
        throw error;
      } finally {
        setIsCartLoading(false);
      }
    },
    [fetchCart],
  );

  const updateCartItem = useCallback(
    async (cartItemId: string, quantity: number): Promise<void> => {
      const token = getSessionToken();
      if (!token) return;

      setIsCartLoading(true);
      try {
        const response = await fetch("/api/cart/items", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-session-token": token,
          },
          body: JSON.stringify({ cartItemId, quantity }),
        });
        if (response.ok) {
          clearCartCache();
          await fetchCart();
        } else {
          const error = await response.json();
          throw new Error(
            error.details || error.error || "Failed to update item",
          );
        }
      } catch (error) {
        captureClientError("Error updating cart item:", error);
        throw error;
      } finally {
        setIsCartLoading(false);
      }
    },
    [fetchCart],
  );

  const removeFromCart = useCallback(
    async (cartItemId: string): Promise<void> => {
      const token = getSessionToken();
      if (!token) return;

      setIsCartLoading(true);
      try {
        const response = await fetch(`/api/cart/items?itemId=${cartItemId}`, {
          method: "DELETE",
          headers: { "x-session-token": token },
        });
        if (response.ok) {
          clearCartCache();
          await fetchCart();
        }
      } catch (error) {
        captureClientError("Error removing from cart:", error);
        throw error;
      } finally {
        setIsCartLoading(false);
      }
    },
    [fetchCart],
  );

  const clearCart = useCallback(async (): Promise<void> => {
    const token = getSessionToken();
    if (!token) return;

    setIsCartLoading(true);
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "x-session-token": token },
      });
      if (response.ok) {
        clearCartCache();
        setCart(null);
        clearSessionToken();
      }
    } catch (error) {
      captureClientError("Error clearing cart:", error);
      throw error;
    } finally {
      setIsCartLoading(false);
    }
  }, []);

  const estimateDelivery = useCallback(
    async (postcode: string): Promise<void> => {
      if (!postcode || postcode.length < 5) {
        setDeliveryEstimate(null);
        return;
      }

      setIsDeliveryEstimating(true);
      try {
        const response = await fetch(
          `/api/delivery/estimate?postcode=${encodeURIComponent(postcode)}`,
        );
        if (response.ok) {
          const data = await response.json();
          setDeliveryEstimate({
            name: data.delivery.name,
            price: data.delivery.price,
            postcode,
          });
        } else {
          setDeliveryEstimate(null);
        }
      } catch (error) {
        captureClientError("Error estimating delivery:", error);
        setDeliveryEstimate(null);
      } finally {
        setIsDeliveryEstimating(false);
      }
    },
    [],
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartLoading,
        isCartOpen,
        cartItemCount,
        cartTotal,
        deliveryEstimate,
        isDeliveryEstimating,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        estimateDelivery,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
