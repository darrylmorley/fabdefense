import { getCategoriesWithImages } from "@/lib/api/categories";
import { logError } from "@/lib/logging/logger";

export async function GET() {
  try {
    const categories = await getCategoriesWithImages();

    return new Response(JSON.stringify({ categories }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    logError("Error fetching categories", error);
    return new Response(JSON.stringify({ error: "Failed to fetch categories" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
