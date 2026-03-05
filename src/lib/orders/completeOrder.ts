/**
 * Shared Order Completion Logic
 * Used by both the client-side process route and server-side webhook callback.
 * Adapted from Shooting Supplies — uses "FABDEFENSE" siteSlug.
 */

import { prisma } from "../prisma";
import {
  sendSaleNotificationToOffice,
  sendOrderConfirmationToCustomer,
} from "../email/saleNotification";
import { completeSale, cancelSale } from "../lightspeed";
import { logger } from "../logging/logger";

export interface OrderCompletionResult {
  success: boolean;
  alreadyProcessed?: boolean;
  cartId?: string;
  lightspeedId?: number;
  error?: string;
}

interface CartWithDetails {
  id: string;
  lightspeedID: number | null;
  customerID: number | null;
  completed: boolean;
  cartItems: Array<{
    quantity: number;
    price: number;
    product: {
      name: string;
      sku: string | null;
      price: number;
      salePrice: number;
      onSale: boolean | null;
    } | null;
  }>;
  customer: {
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    tel: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string | null;
  } | null;
}

export async function completeOrder(
  lightspeedId: number,
  source: "webhook" | "client-redirect" | "server-render",
): Promise<OrderCompletionResult> {
  const logPrefix = `[${source}] Order ${lightspeedId}:`;

  logger.info(`${logPrefix} Starting order completion`);

  try {
    const cart = await prisma.carts.findFirst({
      where: { lightspeedID: lightspeedId },
      include: {
        cartItems: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
                price: true,
                salePrice: true,
                onSale: true,
              },
            },
          },
        },
        customer: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            tel: true,
            address1: true,
            address2: true,
            city: true,
            state: true,
            zip: true,
            country: true,
          },
        },
      },
    });

    if (!cart) {
      logger.error(
        `${logPrefix} No cart found with lightspeedID ${lightspeedId}`,
      );
      return {
        success: false,
        error: `No cart found with lightspeedID ${lightspeedId}`,
      };
    }

    // Idempotency check
    if (cart.completed) {
      logger.info(
        `${logPrefix} Cart already completed, skipping (idempotency)`,
      );
      return {
        success: true,
        alreadyProcessed: true,
        cartId: cart.id,
        lightspeedId: cart.lightspeedID ?? undefined,
      };
    }

    // Guard against race with cancelOrder — if a cancel webhook beat us here,
    // do not overwrite the cancelled state or touch Lightspeed.
    if (cart.cancelled) {
      logger.warn(
        `${logPrefix} Cart already cancelled — refusing to mark complete. Possible duplicate webhook.`,
      );
      return {
        success: false,
        alreadyProcessed: true,
        cartId: cart.id,
        lightspeedId: cart.lightspeedID ?? undefined,
        error: "Cart was already cancelled",
      };
    }

    logger.info(
      `${logPrefix} Found cart ${cart.id} with ${cart.cartItems.length} items`,
    );

    // Check if sale is already completed in the sales table
    const existingSale = await prisma.sales.findFirst({
      where: {
        OR: [{ lightspeedID: lightspeedId }, { cartID: cart.id }],
        completed: true,
      },
    });

    if (existingSale) {
      logger.info(
        `${logPrefix} Sale already completed in sales table, skipping (idempotency)`,
      );
      await prisma.carts.update({
        where: { id: cart.id },
        data: { completed: true, updatedAt: new Date() },
      });
      logger.info({ cartId: cart.id, lightspeedId }, "DB: cart marked completed (idempotency path)");
      return {
        success: true,
        alreadyProcessed: true,
        cartId: cart.id,
        lightspeedId: cart.lightspeedID ?? undefined,
      };
    }

    // Link sale to cart and customer
    try {
      const saleUpdateData: {
        cartID: string;
        siteSlug: string;
        customerID?: number;
      } = {
        cartID: cart.id,
        siteSlug: "FABDEFENSE",
      };

      if (cart.customerID !== null && cart.customerID !== undefined) {
        saleUpdateData.customerID = cart.customerID;
      }

      await prisma.sales.updateMany({
        where: {
          OR: [{ lightspeedID: lightspeedId }, { cartID: cart.id }],
        },
        data: saleUpdateData,
      });
      logger.info({ lightspeedId, cartId: cart.id }, "DB: sale linked to cart and customer");
    } catch (linkError) {
      logger.error(
        linkError,
        `${logPrefix} Error linking sale to cart/customer:`,
      );
    }

    // Mark cart as completed
    await prisma.carts.update({
      where: { id: cart.id },
      data: { completed: true, updatedAt: new Date() },
    });

    // Mark sale as completed
    await prisma.sales.updateMany({
      where: {
        OR: [{ lightspeedID: lightspeedId }, { cartID: cart.id }],
      },
      data: {
        completed: true,
        completeTime: new Date(),
        updatedAt: new Date(),
      },
    });

    logger.info(`${logPrefix} Cart and sale marked as completed in database`);

    // Complete Lightspeed sale
    if (cart.lightspeedID) {
      await completeLightspeedSale(cart as CartWithDetails, logPrefix);
    }

    // Send confirmation emails
    await sendConfirmationEmails(
      cart as CartWithDetails,
      lightspeedId.toString(),
      logPrefix,
    );

    logger.info(`${logPrefix} Order completion finished successfully`);

    return {
      success: true,
      alreadyProcessed: false,
      cartId: cart.id,
      lightspeedId: cart.lightspeedID ?? undefined,
    };
  } catch (error) {
    logger.error(error, `${logPrefix} Error completing order:`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function completeLightspeedSale(
  cart: CartWithDetails,
  logPrefix: string,
): Promise<void> {
  if (!cart.lightspeedID) return;

  try {
    const orderTotal = cart.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    logger.info(
      {
        items: cart.cartItems.map((item) => ({
          name: item.product?.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        calculatedTotal: orderTotal,
      },
      `${logPrefix} Cart calculation:`,
    );

    logger.info(
      orderTotal,
      `${logPrefix} Attempting to complete Lightspeed sale with payment amount:`,
    );

    await completeSale(cart.lightspeedID.toString(), orderTotal);

    logger.info(
      `${logPrefix} Lightspeed sale ${cart.lightspeedID} completed successfully`,
    );
  } catch (error) {
    logger.error(
      error,
      `${logPrefix} Error completing Lightspeed sale ${cart.lightspeedID}:`,
    );
    // Don't fail the entire process — payment has already been taken
  }
}

async function sendConfirmationEmails(
  cart: CartWithDetails,
  orderRef: string,
  logPrefix: string,
): Promise<void> {
  let customerEmail = cart.customer?.email;
  let customerInfo = cart.customer;

  // Fall back to guest email from sales table
  if (!customerEmail && cart.lightspeedID) {
    const sale = await prisma.sales.findFirst({
      where: {
        OR: [{ lightspeedID: cart.lightspeedID }, { cartID: cart.id }],
      },
      select: {
        guestEmail: true,
        guestFirstName: true,
        guestLastName: true,
        shippingAddress: true,
      },
    });

    if (sale?.guestEmail) {
      customerEmail = sale.guestEmail;
      const shippingAddr = sale.shippingAddress as Record<
        string,
        string
      > | null;
      customerInfo = {
        email: sale.guestEmail,
        firstName: sale.guestFirstName,
        lastName: sale.guestLastName,
        tel: shippingAddr?.phone || null,
        address1: shippingAddr?.address1 || null,
        address2: shippingAddr?.address2 || null,
        city: shippingAddr?.city || null,
        state: shippingAddr?.county || null,
        zip: shippingAddr?.postcode || null,
        country: "GB",
      };
    }
  }

  if (!customerEmail) {
    logger.warn(
      `${logPrefix} No customer email available — skipping email notifications`,
    );
    return;
  }

  try {
    const orderTotal = cart.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const emailItems = cart.cartItems.map((item) => ({
      sku: item.product?.sku || "N/A",
      description: item.product?.name || "Unknown Product",
      qty: item.quantity,
      price: item.price,
    }));

    const emailCustomerInfo = {
      title: "",
      firstName: customerInfo?.firstName || "",
      lastName: customerInfo?.lastName || "",
      email: customerEmail,
      phone: customerInfo?.tel || "",
      address1: customerInfo?.address1 || "",
      city: customerInfo?.city || "",
      county: customerInfo?.state || "",
      postcode: customerInfo?.zip || "",
    };

    await sendSaleNotificationToOffice({
      orderRef,
      customer: emailCustomerInfo,
      items: emailItems,
      total: orderTotal,
    });

    await sendOrderConfirmationToCustomer({
      orderRef,
      customer: emailCustomerInfo,
      items: emailItems,
      total: orderTotal,
    });

    logger.info(`${logPrefix} Email notifications sent`);
  } catch (emailError) {
    logger.error(emailError, `${logPrefix} Error sending emails:`);
    // Don't fail — payment has been taken and database updated
  }
}

export async function cancelOrder(
  lightspeedId: number,
  source: "webhook" | "client-redirect" | "server-render",
): Promise<OrderCompletionResult> {
  const logPrefix = `[${source}] Order ${lightspeedId}:`;

  try {
    const cart = await prisma.carts.findFirst({
      where: {
        lightspeedID: lightspeedId,
        completed: false,
        cancelled: false,
      },
    });

    if (!cart) {
      return { success: true, alreadyProcessed: true };
    }

    // Update DB first, atomically. If completeOrder won the race and has already
    // set completed: true, the updateMany will match 0 rows and we back off —
    // preventing a spurious cancelSale() call that would overwrite a completed sale.
    const updated = await prisma.carts.updateMany({
      where: { id: cart.id, completed: false, cancelled: false },
      data: { cancelled: true, updatedAt: new Date() },
    });

    if (updated.count === 0) {
      logger.info(
        `${logPrefix} Cart state changed before cancel could be applied (race condition) — skipping`,
      );
      return { success: true, alreadyProcessed: true };
    }

    logger.info({ cartId: cart.id, lightspeedId }, "DB: cart marked cancelled");

    if (cart.lightspeedID) {
      try {
        await cancelSale(cart.lightspeedID.toString());
        logger.info(`${logPrefix} Lightspeed sale cancelled`);
      } catch (error) {
        logger.error(error, `${logPrefix} Error cancelling Lightspeed sale:`);
      }
    }

    // Reset the cart to a fresh pre-checkout state so the customer can retry.
    // Clear cancelled + lightspeedID so a new sale is created on next checkout.
    const DELIVERY_LIGHTSPEED_IDS = [7476, 8403, 8461];
    await prisma.carts.update({
      where: { id: cart.id },
      data: { cancelled: false, lightspeedID: null, updatedAt: new Date() },
    });
    await prisma.cartItem.deleteMany({
      where: { cartID: cart.id, lightspeedID: { in: DELIVERY_LIGHTSPEED_IDS } },
    });
    logger.info({ cartId: cart.id }, "DB: cart reset to pre-checkout state for retry");

    return {
      success: true,
      cartId: cart.id,
      lightspeedId: cart.lightspeedID ?? undefined,
    };
  } catch (error) {
    logger.error(error, `${logPrefix} Error cancelling order:`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function markOrderRefused(
  lightspeedId: number,
  source: "webhook" | "client-redirect" | "server-render",
): Promise<OrderCompletionResult> {
  const logPrefix = `[${source}] Order ${lightspeedId}:`;

  logger.info(`${logPrefix} Processing payment refusal`);

  try {
    const cart = await prisma.carts.findFirst({
      where: { lightspeedID: lightspeedId, completed: false },
    });

    if (cart) {
      logger.info(
        `${logPrefix} Payment refused — cart ${cart.id} remains active for retry`,
      );
    }

    return {
      success: true,
      cartId: cart?.id,
      lightspeedId,
    };
  } catch (error) {
    logger.error(error, `${logPrefix} Error processing refusal:`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
