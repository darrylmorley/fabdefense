"use client";

import { useEffect } from "react";

interface Props {
  isSuccess: boolean;
  accept: string | undefined;
  cartId: string | undefined;
  orderRef: string | null;
  orderTotal: number | null;
}

export default function ResultClientEffects({
  isSuccess,
  accept,
  cartId,
  orderRef,
  orderTotal,
}: Props) {
  useEffect(() => {
    // Analytics
    if (typeof window.plausible === "function") {
      if (isSuccess) {
        window.plausible("Purchase", {
          ...(orderTotal !== null && {
            revenue: { currency: "GBP", amount: orderTotal },
          }),
          props: { ...(orderRef && { order_ref: orderRef }) },
        });
      } else if (
        accept === "declined" ||
        accept === "cancelled" ||
        accept === "exception"
      ) {
        window.plausible("Payment Failed", {
          props: { reason: accept },
        });
      }
    }

    // On success: clear cart session token and notify cart context
    if (isSuccess) {
      localStorage.removeItem("cart_session_token");
      window.dispatchEvent(new CustomEvent("cart-reset"));

      // Backup: call the process endpoint to ensure order completion
      if (cartId) {
        fetch("/api/payment/worldpay/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accept, cartId }),
        }).catch(() => {});
      }
    }

    // On declined/cancelled: also call process endpoint for tracking
    if ((accept === "declined" || accept === "cancelled") && cartId) {
      fetch("/api/payment/worldpay/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept, cartId }),
      }).catch(() => {});
    }
  }, [isSuccess, accept, cartId, orderRef, orderTotal]);

  return null;
}
