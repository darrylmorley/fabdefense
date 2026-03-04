import {
  getCartBySession,
  getCurrentItemPrice,
} from "@/lib/api/cart";
import { createSale } from "@/lib/lightspeed";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logging/logger";

export async function POST(request: Request) {
  const sessionToken = request.headers.get("x-session-token");

  if (!sessionToken) {
    return new Response(JSON.stringify({ error: "Session token required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const cart = await getCartBySession(sessionToken);

    if (!cart) {
      return new Response(JSON.stringify({ error: "Cart not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!cart.cartItems || cart.cartItems.length === 0) {
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Idempotent: if cart already has a lightspeedID, return it
    if (cart.lightspeedID) {
      return new Response(JSON.stringify({ saleID: cart.lightspeedID }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!cart.customerID) {
      return new Response(
        JSON.stringify({
          error: "Customer must be linked to cart before creating a sale",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const employeeID = Number(process.env.LIGHTSPEED_EMPLOYEE_ID) || 9;
    const registerID = Number(process.env.LIGHTSPEED_REGISTER_ID) || 2;
    const shopID = Number(process.env.LIGHTSPEED_SHOP_ID) || 1;

    const priceChanges = cart.cartItems.filter(
      (item) => getCurrentItemPrice(item) !== item.price,
    );
    if (priceChanges.length > 0) {
      logger.warn(
        {
          priceChanges: priceChanges.map((i) => ({
            lightspeedID: i.lightspeedID,
            stored: i.price,
            current: getCurrentItemPrice(i),
          })),
        },
        "Cart item prices corrected at Lightspeed sale creation",
      );
    }

    const saleData = {
      employeeID,
      registerID,
      shopID,
      completed: false,
      customerID: cart.customerID,
      SaleLines: {
        SaleLine: cart.cartItems.map((item) => ({
          shopID,
          employeeID,
          unitQuantity: item.quantity,
          unitPrice: getCurrentItemPrice(item),
          itemID: item.lightspeedID,
          taxClassID: 1,
        })),
      },
    };

    logger.info(
      { customerID: cart.customerID, itemCount: cart.cartItems.length },
      "Lightspeed: creating sale",
    );
    const saleID = await createSale(saleData);
    logger.info({ saleID }, "Lightspeed: sale created successfully");

    // Store the lightspeedID on the cart
    await prisma.carts.update({
      where: { id: cart.id },
      data: { lightspeedID: saleID, updatedAt: new Date() },
    });
    logger.info({ cartId: cart.id, saleID }, "DB: lightspeedID stored on cart");

    return new Response(JSON.stringify({ saleID }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error(error, "Error creating Lightspeed sale:");
    return new Response(
      JSON.stringify({
        error: "Failed to create sale",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
