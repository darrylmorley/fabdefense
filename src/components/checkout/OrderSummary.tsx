"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";
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

export default function OrderSummary() {
  const { cart, isCartLoading, deliveryEstimate, isDeliveryEstimating } =
    useCart();

  if (!cart || cart.cartItems.length === 0) {
    return null;
  }

  const productItems = cart.cartItems.filter((item) => !isDeliveryItem(item));
  const deliveryItem = cart.cartItems.find((item) => isDeliveryItem(item));

  const subtotal = productItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Use actual delivery item if available (step 2), otherwise use estimate (step 1)
  const deliveryCost = deliveryItem
    ? deliveryItem.price * deliveryItem.quantity
    : deliveryEstimate?.price || 0;

  const total = subtotal + deliveryCost;

  return (
    <div className="bg-white border border-content-border p-5 relative">
      {isCartLoading && (
        <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-fab-aqua animate-spin"
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
        </div>
      )}

      <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-content-text mb-4">
        Order Summary
      </h2>

      {/* Product items */}
      <div className="divide-y divide-content-border">
        {productItems.map((item) => {
          const imageUrl = getProductImage(item);
          const lineTotal = item.price * item.quantity;

          return (
            <div key={item.id} className="flex gap-3 py-3 first:pt-0">
              <div className="shrink-0 w-14 h-14 bg-content-bg overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={item.product.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <svg
                    className="w-6 h-6 text-content-text-muted"
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
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-content-text text-sm font-medium leading-tight line-clamp-2">
                  {item.product.name}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-content-text-muted text-xs">
                    Qty: {item.quantity}
                  </span>
                  <span className="font-mono text-sm font-semibold text-content-text">
                    {formatPrice(lineTotal)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="border-t border-content-border mt-3 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-content-text-secondary">Subtotal</span>
          <span className="font-mono text-sm text-content-text">
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-content-text-secondary">Delivery</span>
          <span className="font-mono text-sm text-content-text">
            {isDeliveryEstimating ? (
              <span className="flex items-center gap-1">
                <svg
                  className="w-3 h-3 animate-spin"
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
                Calculating...
              </span>
            ) : deliveryItem ? (
              formatPrice(deliveryCost)
            ) : deliveryEstimate ? (
              formatPrice(deliveryCost)
            ) : (
              "Enter postcode to calculate"
            )}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-content-border pt-2">
          <span className="font-heading text-sm font-bold uppercase tracking-wider text-content-text">
            Total
          </span>
          <span className="font-mono text-lg font-bold text-content-text">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
