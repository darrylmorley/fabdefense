import {
  completeOrder,
  cancelOrder,
  markOrderRefused,
} from "@/lib/orders/completeOrder";
import { logger } from "@/lib/logging/logger";

export async function POST(request: Request) {
  try {
    const { accept, cartId } = await request.json();

    if (!accept || !cartId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const lightspeedId = Number(cartId);

    if (Number.isNaN(lightspeedId)) {
      return new Response(
        JSON.stringify({
          success: false,
          status: "error",
          orderRef: cartId,
          error: "Invalid order reference",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    switch (accept) {
      case "true": {
        const result = await completeOrder(lightspeedId, "client-redirect");
        return new Response(
          JSON.stringify({
            success: result.success,
            status: result.success ? "completed" : "error",
            orderRef: cartId,
            sessionCleared: true,
            alreadyProcessed: result.alreadyProcessed,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      }

      case "declined": {
        await markOrderRefused(lightspeedId, "client-redirect");
        return new Response(
          JSON.stringify({
            success: false,
            status: "declined",
            orderRef: cartId,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      }

      case "cancelled": {
        await cancelOrder(lightspeedId, "client-redirect");
        return new Response(
          JSON.stringify({
            success: false,
            status: "cancelled",
            orderRef: cartId,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      }

      default: {
        return new Response(
          JSON.stringify({
            success: false,
            status: accept,
            orderRef: cartId,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      }
    }
  } catch (error) {
    logger.error(error, "Payment processing error:");
    return new Response(
      JSON.stringify({ error: "Failed to process payment result" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
