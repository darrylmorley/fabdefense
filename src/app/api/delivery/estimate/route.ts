import { getDeliveryProduct, isValidUKPostcode } from "@/lib/delivery";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logging/logger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get("postcode");

  if (!postcode) {
    return new Response(
      JSON.stringify({ error: "Postcode parameter is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!isValidUKPostcode(postcode)) {
    return new Response(
      JSON.stringify({
        error: "Invalid UK postcode format",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
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
      select: {
        id: true,
        name: true,
        price: true,
        lightspeedID: true
      },
    });

    if (!deliveryProduct) {
      return new Response(
        JSON.stringify({ error: "Delivery product not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        delivery: {
          name: deliveryProduct.name,
          price: deliveryProduct.price,
          lightspeedID: deliveryProduct.lightspeedID
        }
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    logError("Failed to estimate delivery", error);
    return new Response(
      JSON.stringify({
        error: "Failed to estimate delivery cost",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
