import { searchProducts } from "@/lib/api/products";
import { logError } from "@/lib/logging/logger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const limit = Math.min(
    10,
    Math.max(1, Number(searchParams.get("limit")) || 5),
  );

  if (!query || query.length < 2) {
    return new Response(JSON.stringify({ products: [] }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const products = await searchProducts(query, limit);

    const items = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      salePrice: p.salePrice,
      onSale: p.onSale,
      qoh: p.qoh,
      sku: p.sku,
      manufacturerName: p.manufacturers?.name,
      image: p.images?.[0]?.thumbnailUrl || p.images?.[0]?.mediumUrl || null,
    }));

    return new Response(JSON.stringify({ products: items }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logError("Search error", error);
    return new Response(JSON.stringify({ error: "Search failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
