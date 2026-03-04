import { prisma } from "@/lib/prisma";
import { isValidUKPostcode } from "@/lib/delivery";
import { logger, logError } from "@/lib/logging/logger";

export async function POST(request: Request) {
  const sessionToken = request.headers.get("x-session-token");

  if (!sessionToken) {
    logger.warn({ path: "POST /api/cart/customer" }, "Request rejected: missing session token");
    return new Response(
      JSON.stringify({ error: "Session token required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const customerData = await request.json();

    if (!customerData?.email) {
      return new Response(
        JSON.stringify({ error: "Customer email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!isValidUKPostcode(customerData.postcode)) {
      return new Response(
        JSON.stringify({
          error: "Invalid UK postcode. We only ship to UK addresses.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find the cart
    const cart = await prisma.carts.findUnique({
      where: { sessionToken },
    });

    if (!cart) {
      return new Response(
        JSON.stringify({ error: "Cart not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find or create customer by email
    let customer = await prisma.customers.findUnique({
      where: { email: customerData.email },
    });

    if (customer) {
      customer = await prisma.customers.update({
        where: { id: customer.id },
        data: {
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          tel: customerData.phone,
          address1: customerData.address1,
          address2: customerData.address2,
          city: customerData.city,
          state: customerData.county,
          zip: customerData.postcode,
          country: "GB",
          updatedAt: new Date(),
        },
      });
      logger.info({ customerId: customer.id, email: customerData.email }, "DB: customer record updated");
    } else {
      // Temporary negative lightspeedID — will be updated when synced with Lightspeed
      const tempLightspeedId = -1 * (Date.now() % 2000000000);

      customer = await prisma.customers.create({
        data: {
          lightspeedID: tempLightspeedId,
          email: customerData.email,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          tel: customerData.phone,
          address1: customerData.address1,
          address2: customerData.address2,
          city: customerData.city,
          state: customerData.county,
          zip: customerData.postcode,
          country: "GB",
        },
      });
      logger.info({ customerId: customer.id, email: customerData.email }, "DB: new customer created");
    }

    // Link cart to customer
    await prisma.carts.update({
      where: { id: cart.id },
      data: {
        customerID: customer.lightspeedID,
        updatedAt: new Date(),
      },
    });
    logger.info({ cartId: cart.id, customerID: customer.lightspeedID }, "DB: cart linked to customer");

    return new Response(
      JSON.stringify({
        success: true,
        customerId: customer.id,
        customerLightspeedId: customer.lightspeedID,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    logError("Failed to save customer", error);
    return new Response(
      JSON.stringify({
        error: "Failed to save customer information",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
