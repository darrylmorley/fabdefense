"use client";

import { useState, useEffect, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { trackEvent } from "@/lib/analytics";

interface Props {
  productId: number;
  inStock: boolean;
  name?: string;
  price?: number;
}

export default function AddToCartButton({
  productId,
  inStock,
  name,
  price,
}: Props) {
  const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleClick = useCallback(async () => {
    if (!inStock || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await addToCart(productId, 1);
      trackEvent("Add to Cart", {
        props: {
          ...(name && { product: name }),
          ...(price !== undefined && { price }),
        },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add item to cart";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [productId, inStock, isLoading, addToCart, name, price]);

  const disabled = !inStock || isLoading;

  let buttonText = "Add to Cart";
  if (!inStock) buttonText = "Out of Stock";
  else if (isLoading) buttonText = "Adding...";

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`bg-fab-aqua hover:bg-fab-aqua-hover text-white font-bold uppercase tracking-wider py-3.5 px-10 transition-colors duration-200 text-sm w-full sm:w-auto ${
          !inStock
            ? "opacity-50 cursor-not-allowed"
            : isLoading
              ? "opacity-75 cursor-wait"
              : ""
        }`}
      >
        {buttonText}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
