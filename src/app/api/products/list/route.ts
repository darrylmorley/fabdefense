import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { FAB_DEFENSE_MANUFACTURER_ID } from "@/config/config";
import { HIDDEN_CATEGORY_IDS } from "@/lib/constants";
import type { SortOption } from "@/lib/api/products";
import { logError } from "@/lib/logging/logger";

const validSorts: SortOption[] = [
  "name-asc",
  "name-desc",
  "price-asc",
  "price-desc",
  "newest",
];

function getSortOrder(sort: SortOption) {
  switch (sort) {
    case "name-desc":
      return { name: "desc" as const };
    case "price-asc":
      return { price: "asc" as const };
    case "price-desc":
      return { price: "desc" as const };
    case "newest":
      return { createdAt: "desc" as const };
    default:
      return { name: "asc" as const };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      48,
      Math.max(1, Number(searchParams.get("limit")) || 24),
    );
    const sortParam = searchParams.get("sort");
    const sort: SortOption = validSorts.includes(sortParam as SortOption)
      ? (sortParam as SortOption)
      : "name-asc";
    const categorySlug = searchParams.get("category") || null;
    const searchQuery = searchParams.get("q")?.trim() || "";

    const where: Prisma.productsWhereInput = {
      manufacturerID: FAB_DEFENSE_MANUFACTURER_ID,
      archived: false,
      images: { some: {} },
      categoryID: { notIn: HIDDEN_CATEGORY_IDS },
    };

    // Add search filter if query exists
    if (searchQuery) {
      const searchConditions = [
        { name: { contains: searchQuery, mode: "insensitive" as const } },
        { sku: { contains: searchQuery, mode: "insensitive" as const } },
      ];

      if (where.OR) {
        // If we already have category OR conditions, we need to combine them
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    if (categorySlug) {
      const category = await prisma.categories.findFirst({
        where: { slug: categorySlug },
      });

      if (category) {
        const categoryConditions = [
          { categoryID: category.lightspeedID },
          { categories: { parentID: category.lightspeedID } },
        ];

        if (where.OR) {
          // If we already have search OR conditions, we need to combine them
          where.AND = [{ OR: where.OR }, { OR: categoryConditions }];
          delete where.OR;
        } else {
          where.OR = categoryConditions;
        }
      }
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        orderBy: getSortOrder(sort),
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: {
            take: 1,
            orderBy: { ordering: "asc" as const },
          },
          manufacturers: {
            select: { name: true },
          },
        },
      }),
      prisma.products.count({ where }),
    ]);

    const items = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      salePrice: p.salePrice,
      onSale: p.onSale,
      qoh: p.qoh,
      lightspeedID: p.lightspeedID,
      categoryID: p.categoryID,
      manufacturerName: p.manufacturers?.name,
      images:
        p.images?.map((img) => ({
          itemID: img.itemID,
          thumbnailUrl: img.thumbnailUrl,
          mediumUrl: img.mediumUrl,
          largeUrl: img.largeUrl,
          ordering: img.ordering,
        })) || [],
    }));

    return new Response(
      JSON.stringify({
        products: items,
        total,
        page,
        hasMore: page * limit < total,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    logError("Failed to list products", error);
    return new Response(JSON.stringify({ error: "Failed to fetch products" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
