import {
  addItemToCart,
  updateCartItem,
  removeFromCart,
} from "@/lib/api/cart";
import { logger, logError } from "@/lib/logging/logger";

export async function POST(request: Request) {
  const sessionToken = request.headers.get("x-session-token");

  if (!sessionToken) {
    logger.warn({ path: "POST /api/cart/items" }, "Request rejected: missing session token");
    return new Response(
      JSON.stringify({ error: "Session token required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || typeof productId !== "number") {
      return new Response(
        JSON.stringify({ error: "Valid productId is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const cart = await addItemToCart(sessionToken, productId, quantity ?? 1);

    return new Response(JSON.stringify(cart), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logError("Failed to add item to cart", error);
    return new Response(
      JSON.stringify({
        error: "Failed to add item to cart",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(request: Request) {
  const sessionToken = request.headers.get("x-session-token");

  if (!sessionToken) {
    logger.warn({ path: "PUT /api/cart/items" }, "Request rejected: missing session token");
    return new Response(
      JSON.stringify({ error: "Session token required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await request.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId || typeof cartItemId !== "string") {
      return new Response(
        JSON.stringify({ error: "Valid cartItemId is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (quantity === undefined || typeof quantity !== "number") {
      return new Response(
        JSON.stringify({ error: "Valid quantity is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const cart = await updateCartItem(sessionToken, cartItemId, quantity);

    return new Response(JSON.stringify(cart), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logError("Failed to update cart item", error);
    return new Response(
      JSON.stringify({
        error: "Failed to update cart item",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(request: Request) {
  const sessionToken = request.headers.get("x-session-token");

  if (!sessionToken) {
    logger.warn({ path: "DELETE /api/cart/items" }, "Request rejected: missing session token");
    return new Response(
      JSON.stringify({ error: "Session token required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return new Response(
        JSON.stringify({ error: "itemId query parameter is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const cart = await removeFromCart(sessionToken, itemId);

    return new Response(JSON.stringify(cart), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logError("Failed to remove cart item", error);
    return new Response(
      JSON.stringify({
        error: "Failed to remove item from cart",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
