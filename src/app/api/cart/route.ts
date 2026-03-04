import { getCartBySession, clearCart } from "@/lib/api/cart";
import { logger, logError } from "@/lib/logging/logger";

export async function GET(request: Request) {
  const sessionToken = request.headers.get("x-session-token");

  if (!sessionToken) {
    logger.warn({ path: "GET /api/cart" }, "Request rejected: missing session token");
    return new Response(
      JSON.stringify({ error: "Session token required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const cart = await getCartBySession(sessionToken);

    if (!cart) {
      return new Response(
        JSON.stringify({ error: "Cart not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(cart), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logError("Failed to get cart", error);
    return new Response(
      JSON.stringify({
        error: "Failed to get cart",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(request: Request) {
  const sessionToken = request.headers.get("x-session-token");

  if (!sessionToken) {
    logger.warn({ path: "DELETE /api/cart" }, "Request rejected: missing session token");
    return new Response(
      JSON.stringify({ error: "Session token required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const cart = await clearCart(sessionToken);

    return new Response(JSON.stringify(cart), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logError("Failed to clear cart", error);
    return new Response(
      JSON.stringify({
        error: "Failed to clear cart",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
