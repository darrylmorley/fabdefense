"use client";

import { useEffect, useCallback, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { trackEvent } from "@/lib/analytics";
import type { CartItem } from "@/types";

const DELIVERY_LIGHTSPEED_IDS = [7476, 8403, 8461];

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);

function isDeliveryItem(item: CartItem): boolean {
  return (
    item.lightspeedID !== null &&
    DELIVERY_LIGHTSPEED_IDS.includes(item.lightspeedID)
  );
}

function getProductImage(item: CartItem): string | null {
  if (!item.product.images || item.product.images.length === 0) return null;
  const sorted = [...item.product.images].sort(
    (a, b) => (a.ordering ?? 0) - (b.ordering ?? 0),
  );
  return sorted[0]?.thumbnailUrl ?? null;
}

function CartItemRow({ item }: { item: CartItem }) {
  const { updateCartItem, removeFromCart } = useCart();
  const imageUrl = getProductImage(item);
  const lineTotal = item.price * item.quantity;
  const productUrl = item.product.slug ? `/product/${item.product.slug}` : "#";

  const handleDecrement = useCallback(async () => {
    if (item.quantity <= 1) {
      await removeFromCart(item.id);
    } else {
      await updateCartItem(item.id, item.quantity - 1);
    }
  }, [item.id, item.quantity, removeFromCart, updateCartItem]);

  const handleIncrement = useCallback(async () => {
    await updateCartItem(item.id, item.quantity + 1);
  }, [item.id, item.quantity, updateCartItem]);

  const handleRemove = useCallback(async () => {
    await removeFromCart(item.id);
  }, [item.id, removeFromCart]);

  return (
    <div className="flex gap-3 py-4 border-b border-content-border last:border-b-0">
      {/* Thumbnail */}
      <a
        href={productUrl}
        className="shrink-0 w-20 h-20 bg-content-bg overflow-hidden flex items-center justify-center"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.product.name}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <svg
            className="w-8 h-8 text-content-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )}
      </a>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <a
          href={productUrl}
          className="text-content-text text-sm font-medium leading-tight hover:text-fab-aqua transition-colors line-clamp-2"
        >
          {item.product.name}
        </a>

        <p className="font-mono text-content-text-secondary text-xs mt-1">
          {formatPrice(item.price)}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-content-border">
            <button
              type="button"
              onClick={handleDecrement}
              className="w-7 h-7 flex items-center justify-center text-content-text-secondary hover:text-content-text hover:bg-content-bg transition-colors text-sm"
              aria-label="Decrease quantity"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <span className="w-8 h-7 flex items-center justify-center text-sm font-mono text-content-text border-x border-content-border">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              className="w-7 h-7 flex items-center justify-center text-content-text-secondary hover:text-content-text hover:bg-content-bg transition-colors text-sm"
              aria-label="Increase quantity"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold text-content-text">
              {formatPrice(lineTotal)}
            </span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-content-text-muted hover:text-red-500 transition-colors p-0.5"
              aria-label={`Remove ${item.product.name} from cart`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { cart, isCartOpen, isCartLoading, cartTotal, setIsCartOpen } =
    useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  const closeDrawer = useCallback(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        closeDrawer();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeDrawer]);

  // Trap focus inside the drawer when open
  useEffect(() => {
    if (!isCartOpen || !drawerRef.current) return;

    const drawer = drawerRef.current;
    const focusableElements = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [isCartOpen]);

  // Filter out delivery items for display
  const productItems = cart
    ? cart.cartItems.filter((item) => !isDeliveryItem(item))
    : [];
  const productItemCount = productItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const isEmpty = productItems.length === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isCartOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 h-full w-full sm:w-96 md:w-md bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Loading overlay */}
        {isCartLoading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <svg
                className="w-6 h-6 text-fab-aqua animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-xs text-content-text-muted uppercase tracking-wider">
                Updating...
              </span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-content-border shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-content-text">
              Your Cart
            </h2>
            {productItemCount > 0 && (
              <span className="bg-fab-aqua text-white text-xs font-bold min-w-5 h-5 flex items-center justify-center rounded-full px-1.5">
                {productItemCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="text-content-text-muted hover:text-content-text transition-colors p-1"
            aria-label="Close cart"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        {isEmpty ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
            <svg
              className="w-16 h-16 text-content-text-muted mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="text-content-text font-heading text-lg uppercase tracking-wider mb-1">
              Your cart is empty
            </p>
            <p className="text-content-text-muted text-base mb-6">
              Add items to get started.
            </p>
            <button
              type="button"
              onClick={closeDrawer}
              className="bg-fab-aqua hover:bg-fab-aqua-hover text-white font-bold uppercase tracking-wider py-2.5 px-8 text-sm transition-colors duration-200"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Item list */}
            <div className="flex-1 overflow-y-auto px-5 overscroll-contain">
              {productItems.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-content-border px-5 py-4 bg-white">
              {/* Subtotal */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-heading text-sm uppercase tracking-wider text-content-text-secondary">
                  Subtotal
                </span>
                <span className="font-mono text-lg font-bold text-content-text">
                  {formatPrice(cartTotal)}
                </span>
              </div>

              {/* Checkout button */}
              <a
                href="/checkout"
                onClick={() =>
                  trackEvent("Begin Checkout", {
                    props: {
                      item_count: productItemCount,
                      cart_value: cartTotal,
                    },
                  })
                }
                className="block w-full bg-fab-aqua hover:bg-fab-aqua-hover text-white font-bold uppercase tracking-wider py-3.5 text-sm text-center transition-colors duration-200"
              >
                Proceed to Checkout
              </a>

              {/* Continue Shopping */}
              <button
                type="button"
                onClick={closeDrawer}
                className="w-full text-center text-content-text-secondary hover:text-content-text text-sm mt-3 py-1.5 transition-colors uppercase tracking-wide"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
