"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { getSessionToken } from "@/context/CartContext";

export default function CartBadge() {
  const { cartItemCount, fetchCart } = useCart();

  useEffect(() => {
    if (getSessionToken()) {
      fetchCart();
    }
  }, [fetchCart]);

  if (cartItemCount === 0) return null;

  return (
    <span className="absolute -top-1.5 -right-1.5 bg-fab-aqua text-white text-[10px] font-bold min-w-4.5 h-4.5 flex items-center justify-center rounded-full leading-none">
      {cartItemCount > 99 ? "99+" : cartItemCount}
    </span>
  );
}
