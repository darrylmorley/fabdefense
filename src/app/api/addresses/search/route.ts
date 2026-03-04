import { isValidUKPostcode } from "@/lib/delivery";
import { logger } from "@/lib/logging/logger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get("postcode");

  if (!postcode) {
    return new Response(JSON.stringify({ error: "Postcode is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.IDEAL_POSTCODE_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Address lookup not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!isValidUKPostcode(postcode)) {
    return new Response(
      JSON.stringify({
        error: "Invalid UK postcode format. We only ship to UK addresses.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const sanitizedPostcode = postcode.replace(/\s+/g, "");

  try {
    logger.info({ postcode: sanitizedPostcode }, "Ideal Postcodes: lookup attempt");

    const response = await fetch(
      `https://api.ideal-postcodes.co.uk/v1/postcodes/${sanitizedPostcode}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `api_key="${apiKey}"`,
        },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return new Response(JSON.stringify({ result: [] }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    logger.info({ postcode: sanitizedPostcode, status: response.status }, "Ideal Postcodes: lookup succeeded");

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error(error, "Address search error:");
    return new Response(
      JSON.stringify({ error: "Failed to search addresses" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
