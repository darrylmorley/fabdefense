import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";
import { FAB_DEFENSE_MANUFACTURER_ID, SITE_SLUG } from "../../config/config";
import { HIDDEN_CATEGORY_IDS } from "../constants";
import { logger } from "../logging/logger";
import { formatProductName } from "../utils/product-format";

const imageInclude = {
  take: 1,
  orderBy: { ordering: "asc" as const },
};

const manufacturerSelect = {
  select: { name: true },
};

export type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "newest";

function getSortOrder(sort: SortOption) {
  switch (sort) {
    case "name-asc":
      return { name: "asc" as const };
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

export async function getFeaturedProducts(limit = 8) {
  try {
    const products = await prisma.products.findMany({
      where: {
        manufacturerID: FAB_DEFENSE_MANUFACTURER_ID,
        archived: false,
        qoh: { gt: 0 },
        images: { some: {} },
        categoryID: { notIn: HIDDEN_CATEGORY_IDS },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        images: imageInclude,
        manufacturers: manufacturerSelect,
        categories: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    products.forEach((product) => {
      product.name = formatProductName(product.name);
    });

    return products;
  } catch (error) {
    logger.error(error, "Error fetching featured products:");
    return [];
  }
}

export async function getCategoryProducts({
  categorySlug,
  page = 1,
  limit = 24,
  sort = "name-asc" as SortOption,
}: {
  categorySlug: string;
  page?: number;
  limit?: number;
  sort?: SortOption;
}) {
  try {
    const category = await prisma.categories.findUnique({
      where: { slug: categorySlug },
      include: {
        category_overrides: {
          where: { site_slug: SITE_SLUG },
          take: 1,
        },
      },
    });

    if (!category) {
      return { products: [], total: 0, category: null };
    }

    const categoryFilter = [
      { categoryID: category.lightspeedID },
      {
        categories: {
          parentID: category.lightspeedID,
        },
      },
    ];

    const where = {
      manufacturerID: FAB_DEFENSE_MANUFACTURER_ID,
      archived: false,
      images: { some: {} },
      categoryID: { notIn: HIDDEN_CATEGORY_IDS },
      OR: categoryFilter,
    };

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        orderBy: getSortOrder(sort),
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: imageInclude,
          manufacturers: manufacturerSelect,
        },
      }),
      prisma.products.count({ where }),
    ]);

    products.forEach((product) => {
      product.name = formatProductName(product.name);
    });

    return { products, total, category };
  } catch (error) {
    logger.error(error, "Error fetching category products:");
    return { products: [], total: 0, category: null };
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.products.findFirst({
      where: {
        slug,
        manufacturerID: FAB_DEFENSE_MANUFACTURER_ID,
        archived: { not: true },
      },
      include: {
        categories: {
          include: {
            categories: true,
          },
        },
        manufacturers: true,
        images: {
          orderBy: { ordering: "asc" },
        },
      },
    });

    if (product) {
      product.name = formatProductName(product.name);
    }

    return product;
  } catch (error) {
    logger.error(error, "Error fetching product by slug:");
    return null;
  }
}

export async function getRelatedProducts(
  productId: number,
  categoryId: number | null,
  limit = 4,
) {
  try {
    const products = await prisma.products.findMany({
      where: {
        manufacturerID: FAB_DEFENSE_MANUFACTURER_ID,
        archived: false,
        id: { not: productId },
        qoh: { gt: 0 },
        images: { some: {} },
        ...(categoryId !== null ? { categoryID: categoryId } : {}),
      },
      orderBy: { isFeatured: "desc" },
      take: limit,
      include: {
        images: imageInclude,
        manufacturers: manufacturerSelect,
      },
    });

    products.forEach((product) => {
      product.name = formatProductName(product.name);
    });

    return products;
  } catch (error) {
    logger.error(error, "Error fetching related products:");
    return [];
  }
}

export async function searchProducts(query: string, limit = 20) {
  try {
    const products = await prisma.products.findMany({
      where: {
        manufacturerID: FAB_DEFENSE_MANUFACTURER_ID,
        archived: false,
        images: { some: {} },
        categoryID: { notIn: HIDDEN_CATEGORY_IDS },
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { sku: { contains: query, mode: "insensitive" as const } },
        ],
      },
      take: limit,
      include: {
        images: imageInclude,
        manufacturers: manufacturerSelect,
      },
    });

    products.forEach((product) => {
      product.name = formatProductName(product.name);
    });

    return products;
  } catch (error) {
    logger.error(error, "Error searching products:");
    return [];
  }
}

export async function getProductsByIds(lightspeedIds: number[]) {
  try {
    if (lightspeedIds.length === 0) return [];

    const products = await prisma.products.findMany({
      where: {
        lightspeedID: { in: lightspeedIds },
        archived: false,
      },
      include: {
        images: { take: 1, orderBy: { ordering: "asc" } },
        manufacturers: { select: { name: true } },
      },
    });

    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: formatProductName(p.name),
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

    return formattedProducts;
  } catch (error) {
    logger.error(error, "Error fetching products by IDs:");
    return [];
  }
}

export async function getShopProducts({
  sort = "name-asc" as SortOption,
  searchQuery = "",
  limit = 24,
}: {
  sort?: SortOption;
  searchQuery?: string;
  limit?: number;
}) {
  try {
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

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        orderBy: getSortOrder(sort),
        take: limit,
        include: {
          images: imageInclude,
          manufacturers: manufacturerSelect,
        },
      }),
      prisma.products.count({ where }),
    ]);

    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: formatProductName(p.name),
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

    return {
      products: formattedProducts,
      total,
      hasMore: total > limit,
    };
  } catch (error) {
    logger.error(error, "Error fetching shop products:");
    return {
      products: [],
      total: 0,
      hasMore: false,
    };
  }
}
