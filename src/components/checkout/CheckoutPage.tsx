"use client";
import { captureClientError } from "@/lib/clientError";

import { useState, useEffect, useCallback } from "react";
import { useCart, getSessionToken } from "@/context/CartContext";
import type { AddressData } from "@/types";
import AddressForm from "@/components/checkout/AddressForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import WorldpayWidget from "@/components/checkout/WorldpayWidget";
import PaymentOptions from "@/components/checkout/PaymentOptions";

import { trackEvent } from "@/lib/analytics";

const DELIVERY_LIGHTSPEED_IDS = [7476, 8403, 8461];

type Step = 1 | 2;

export default function CheckoutPage() {
  const { cart, isCartLoading, fetchCart } = useCart();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [worldpayUrl, setWorldpayUrl] = useState<string | null>(null);
  const [cartId, setCartId] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Load cart on mount — handle UCP token handoff before fetching
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ucpToken = params.get("token");
    if (ucpToken) {
      localStorage.setItem("cart_session_token", ucpToken);
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.toString());
    }

    const token = getSessionToken();
    if (token && !cart) {
      fetchCart().then(() => setInitialized(true));
    } else {
      setInitialized(true);
    }
  }, []);

  // Fire Step 1 viewed once cart is ready
  useEffect(() => {
    if (initialized && cart && cart.cartItems.length > 0) {
      trackEvent("Checkout Step 1 Viewed");
    }
  }, [initialized]);

  // Clear error after 8 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 8000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleAddressSubmit = useCallback(
    async (shipping: AddressData, billing: AddressData) => {
      const token = getSessionToken();
      if (!token) {
        setError("No cart session found. Please add items to your cart first.");
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        // 1. Set delivery item based on postcode
        const deliveryRes = await fetch("/api/cart/delivery", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-token": token,
          },
          body: JSON.stringify({ postcode: shipping.postcode }),
        });

        if (!deliveryRes.ok) {
          const err = await deliveryRes.json();
          throw new Error(err.error || "Failed to set delivery");
        }

        // 2. Save customer info and link to cart
        const customerRes = await fetch("/api/cart/customer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-token": token,
          },
          body: JSON.stringify(shipping),
        });

        if (!customerRes.ok) {
          const err = await customerRes.json();
          throw new Error(err.error || "Failed to save customer information");
        }

        // 3. Create Lightspeed sale
        const saleRes = await fetch("/api/lightspeed/sale/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-token": token,
          },
        });

        if (!saleRes.ok) {
          const err = await saleRes.json();
          throw new Error(err.error || "Failed to create sale");
        }

        const { saleID } = await saleRes.json();

        // 4. Create Worldpay payment session
        const paymentRes = await fetch("/api/payment/worldpay/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-token": token,
          },
          body: JSON.stringify({
            shippingAddress: shipping,
            billingAddress: billing,
          }),
        });

        if (!paymentRes.ok) {
          const err = await paymentRes.json();
          throw new Error(err.error || "Failed to create payment session");
        }

        const paymentData = await paymentRes.json();

        console.log("Payment session created:", paymentData);

        // Extract the iframe URL from Worldpay response
        const iframeUrl =
          paymentData.url ||
          paymentData._links?.["payment:session"]?.href ||
          paymentData._links?.url?.href;

        console.log("Extracted iframe URL:", iframeUrl);

        if (!iframeUrl) {
          captureClientError("No valid iframe URL found in payment response:", paymentData);
          throw new Error("Payment service did not return a valid session URL");
        }

        // Refresh cart to show delivery line item
        await fetchCart();

        // Delivery cost from the now-updated cart
        const deliveryItem = cart?.cartItems.find(
          (item) =>
            item.lightspeedID !== null &&
            DELIVERY_LIGHTSPEED_IDS.includes(item.lightspeedID),
        );
        trackEvent("Checkout Step 2 Viewed", {
          props: {
            ...(deliveryItem && { delivery_cost: deliveryItem.price }),
          },
        });

        // Move to step 2
        setWorldpayUrl(iframeUrl);
        setCartId(saleID);
        setStep(2);
      } catch (err) {
        captureClientError("Checkout error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [cart, fetchCart],
  );

  // Loading state
  if (!initialized || isCartLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="w-8 h-8 text-fab-aqua animate-spin"
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
          <span className="text-sm text-content-text-muted uppercase tracking-wider">
            Loading checkout...
          </span>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <svg
          className="w-16 h-16 text-content-text-muted mx-auto mb-4"
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
        <h2 className="font-heading text-xl uppercase tracking-wider text-content-text mb-2">
          Your cart is empty
        </h2>
        <p className="text-content-text-muted text-sm mb-6">
          Add items to your cart before checking out.
        </p>
        <a
          href="/shop"
          className="inline-block bg-fab-aqua hover:bg-fab-aqua-hover text-white font-bold uppercase tracking-wider py-3 px-8 text-sm transition-colors duration-200"
        >
          Browse Products
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div
          className={`flex items-center gap-2 ${
            step === 1 ? "text-fab-aqua" : "text-content-text-muted"
          }`}
        >
          <span
            className={`w-7 h-7 flex items-center justify-center text-sm font-bold rounded-full ${
              step === 1
                ? "bg-fab-aqua text-white"
                : "bg-content-border text-content-text-muted"
            }`}
          >
            1
          </span>
          <span className="font-heading text-sm uppercase tracking-wider font-bold">
            Delivery Details
          </span>
        </div>

        <div className="w-8 h-px bg-content-border" />

        <div
          className={`flex items-center gap-2 ${
            step === 2 ? "text-fab-aqua" : "text-content-text-muted"
          }`}
        >
          <span
            className={`w-7 h-7 flex items-center justify-center text-sm font-bold rounded-full ${
              step === 2
                ? "bg-fab-aqua text-white"
                : "bg-content-border text-content-text-muted"
            }`}
          >
            2
          </span>
          <span className="font-heading text-sm uppercase tracking-wider font-bold">
            Payment
          </span>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 mb-6">
          {error}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: form or payment */}
        <div className="lg:col-span-7">
          {step === 1 ? (
            <AddressForm
              onSubmit={handleAddressSubmit}
              isSubmitting={isSubmitting}
            />
          ) : (
            <>
              {worldpayUrl && cartId && (
                <WorldpayWidget worldpayUrl={worldpayUrl} cartId={cartId} />
              )}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-4 text-sm text-content-text-secondary hover:text-content-text transition-colors uppercase tracking-wide"
              >
                &larr; Back to Delivery Details
              </button>
            </>
          )}
        </div>

        {/* Right column: order summary */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <OrderSummary />
            {/* Card SVG's */}
            <PaymentOptions />
          </div>
        </div>
      </div>
    </div>
  );
}
