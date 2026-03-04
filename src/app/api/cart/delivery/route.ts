import { setDeliveryItem, removeDeliveryItems, getCartBySession } from "@/lib/api/cart";
import { getDeliveryProduct, isValidUKPostcode, isNorthernIrelandPostcode, cartContainsMagazines } from "@/lib/delivery";
import { prisma } from "@/lib/prisma";
import { logger, logError } from "@/lib/logging/logger";

export async function POST(request: Request) {
  const sessionToken = request.headers.get("x-session-token");

  if (!sessionToken) {
    logger.warn({ path: "POST /api/cart/delivery" }, "Request rejected: missing session token");
    return new Response(
      JSON.stringify({ error: "Session token required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { postcode } = await request.json();

    if (!postcode) {
      return new Response(
        JSON.stringify({ error: "Postcode is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!isValidUKPostcode(postcode)) {
      return new Response(
        JSON.stringify({
          error: "Invalid UK postcode format. We only ship to UK addresses.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Block magazine items from being shipped to NI
    if (isNorthernIrelandPostcode(postcode)) {
      const cart = await getCartBySession(sessionToken);
      if (cart && cartContainsMagazines(cart.cartItems)) {
        return new Response(
          JSON.stringify({
            error: "Unfortunately, magazine products cannot be delivered to Northern Ireland. Please remove magazine items from your cart or use a mainland UK delivery address.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const deliveryInfo = getDeliveryProduct(postcode);

    if (!deliveryInfo.isAvailable) {
      return new Response(
        JSON.stringify({
          error: deliveryInfo.reason || "Delivery not available for this postcode",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find the delivery product in the database by lightspeedID
    const deliveryProduct = await prisma.products.findFirst({
      where: { lightspeedID: deliveryInfo.product.lightspeedID },
      select: { id: true },
    });

    if (!deliveryProduct) {
      return new Response(
        JSON.stringify({ error: "Delivery product not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const updatedCart = await setDeliveryItem(
      sessionToken,
      deliveryProduct.id
    );

    return new Response(JSON.stringify({ success: true, cart: updatedCart }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logError("Failed to set delivery item", error);
    return new Response(
      JSON.stringify({
        error: "Failed to set delivery item",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(request: Request) {
  const sessionToken = request.headers.get("x-session-token");

  if (!sessionToken) {
    logger.warn({ path: "DELETE /api/cart/delivery" }, "Request rejected: missing session token");
    return new Response(
      JSON.stringify({ error: "Session token required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const removedCount = await removeDeliveryItems(sessionToken);

    return new Response(
      JSON.stringify({ success: true, removedCount }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    logError("Failed to remove delivery items", error);
    return new Response(
      JSON.stringify({
        error: "Failed to remove delivery items",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
