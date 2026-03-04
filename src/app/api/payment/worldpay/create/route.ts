import { config } from "@/config/config";
import { getCartBySession, getCurrentItemPrice } from "@/lib/api/cart";
import { isValidUKPostcode } from "@/lib/delivery";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
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
    const { shippingAddress, billingAddress } = await request.json();

    if (!shippingAddress || !billingAddress) {
      return new Response(
        JSON.stringify({ error: "Missing required address data" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!isValidUKPostcode(shippingAddress.postcode)) {
      return new Response(
        JSON.stringify({
          error: "Invalid shipping postcode. We only ship to UK addresses.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!isValidUKPostcode(billingAddress.postcode)) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid billing postcode. We only accept UK billing addresses.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const cart = await getCartBySession(sessionToken);

    if (!cart) {
      return new Response(JSON.stringify({ error: "Cart not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!cart.lightspeedID) {
      return new Response(
        JSON.stringify({
          error: "Sale must be created before initiating payment",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const verifiedTotal = cart.cartItems.reduce(
      (sum, item) => sum + getCurrentItemPrice(item) * item.quantity,
      0,
    );

    if (verifiedTotal !== cart.total) {
      logger.warn(
        { storedTotal: cart.total, verifiedTotal },
        "Cart total corrected at Worldpay payment creation",
      );
    }

    const totalAmountPence = Math.round(verifiedTotal * 100);
    const orderRef = String(cart.lightspeedID);

    // Build Worldpay Payment Pages request
    const paymentRequest = {
      transactionReference: orderRef,
      merchant: { entity: config.worldpayEntity },
      narrative: { line1: "FAB Defense UK" },
      value: {
        currency: "GBP",
        amount: totalAmountPence,
      },
      billingAddress: {
        address1: billingAddress.address1,
        address2: billingAddress.address2 || undefined,
        city: billingAddress.city,
        state: billingAddress.county,
        postalCode: billingAddress.postcode,
        countryCode: "GB",
      },
      riskData: {
        shipping: {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          address: {
            address1: shippingAddress.address1,
            address2: shippingAddress.address2 || undefined,
            city: shippingAddress.city,
            state: shippingAddress.county,
            postalCode: shippingAddress.postcode,
            phoneNumber: shippingAddress.phone,
            countryCode: "GB",
          },
        },
      },
    };

    const base64Credentials = Buffer.from(
      `${config.worldpayUser}:${config.worldpayPassword}`,
    ).toString("base64");

    const response = await fetch(config.worldPayURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.worldpay.payment_pages-v1.hal+json",
        "User-Agent": "FABDefenseUK/1.0",
        Authorization: `Basic ${base64Credentials}`,
      },
      body: JSON.stringify(paymentRequest),
    });

    logger.info(
      {
        url: config.worldPayURL,
        orderRef,
        totalAmountPence,
      },
      "Worldpay API request",
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        {
          status: response.status,
          statusText: response.statusText,
          response: errorText,
          headers: Object.fromEntries(response.headers.entries()),
        },
        "Worldpay API error:",
      );
      return new Response(
        JSON.stringify({
          error: `Payment service error: ${response.status}`,
          details: errorText,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const data = await response.json();

    logger.info(
      {
        status: response.status,
        data,
        extractedUrls: {
          url: data.url,
          paymentSessionLink: data._links?.["payment:session"]?.href,
          urlLink: data._links?.url?.href,
        },
      },
      "Worldpay API response:",
    );

    // Upsert sale record in database
    await prisma.sales.upsert({
      where: { lightspeedID: cart.lightspeedID },
      update: {
        siteSlug: "FABDEFENSE",
        referenceNumber: orderRef,
        updatedAt: new Date(),
        guestFirstName: shippingAddress.firstName,
        guestLastName: shippingAddress.lastName,
        guestEmail: shippingAddress.email,
        shippingAddress: shippingAddress as unknown as Record<string, unknown>,
        billingAddress: billingAddress as unknown as Record<string, unknown>,
        cartID: cart.id,
        customerID: cart.customerID,
      },
      create: {
        id: nanoid(),
        lightspeedID: cart.lightspeedID,
        cartID: cart.id,
        customerID: cart.customerID,
        total: verifiedTotal,
        subtotal: verifiedTotal,
        completed: false,
        referenceNumber: orderRef,
        siteSlug: "FABDEFENSE",
        guestFirstName: shippingAddress.firstName,
        guestLastName: shippingAddress.lastName,
        guestEmail: shippingAddress.email,
        shippingAddress: shippingAddress as unknown as Record<string, unknown>,
        billingAddress: billingAddress as unknown as Record<string, unknown>,
      },
    });
    logger.info({ lightspeedID: cart.lightspeedID, orderRef }, "DB: sale record upserted");

    return new Response(
      JSON.stringify({
        success: true,
        ...data,
        orderRef,
        amount: totalAmountPence,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    logger.error(error, "Worldpay payment creation error:");
    return new Response(
      JSON.stringify({ error: "Failed to create payment session" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
