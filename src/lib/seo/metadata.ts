import type { PageMeta } from "../../types";

const SITE_URL = "https://www.fabdefense.co.uk";
const SITE_NAME = "FAB Defense UK";

export function generateHomeMeta(): PageMeta {
  return {
    title: `${SITE_NAME} | Premium Tactical Accessories`,
    description:
      "Shop FAB Defense tactical grips, buttstocks, bipods, magazines, sights and magazine pouches. Official UK retailer with fast delivery.",
    canonical: SITE_URL,
    ogType: "website",
    keywords: [
      "fab defense",
      "tactical grips",
      "buttstocks",
      "bipods",
      "tactical accessories uk",
      "airsoft accessories",
      "firearms accessories",
    ],
  };
}

export function generateProductMeta(product: {
  name: string;
  slug: string | null;
  shortDescription?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  price: number;
  images?: { largeUrl?: string | null; mediumUrl?: string | null }[];
}): PageMeta {
  const title = product.metaTitle || `${product.name} | ${SITE_NAME}`;
  const description =
    product.metaDescription ||
    (product.shortDescription
      ? `Buy ${product.name}. ${product.shortDescription}`.substring(0, 160)
      : `Buy ${product.name} at ${SITE_NAME}. Premium tactical accessories with fast UK delivery.`);

  return {
    title,
    description,
    canonical: `${SITE_URL}/product/${product.slug}`,
    ogImage: product.images?.[0]?.largeUrl || product.images?.[0]?.mediumUrl || undefined,
    ogType: "product",
  };
}

export function generateCategoryMeta(category: {
  name: string;
  slug: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  description?: string | null;
}, page?: number): PageMeta {
  const pageStr = page && page > 1 ? ` - Page ${page}` : "";
  const title =
    category.metaTitle || `Shop ${category.name}${pageStr} | ${SITE_NAME}`;
  const description =
    category.metaDescription ||
    category.description ||
    `Browse our range of ${category.name} at ${SITE_NAME}. Premium tactical accessories with fast UK delivery.`;

  return {
    title,
    description: description.substring(0, 160),
    canonical: `${SITE_URL}/${category.slug}${page && page > 1 ? `?page=${page}` : ""}`,
    ogType: "website",
    keywords: [
      category.name.toLowerCase(),
      `${category.name.toLowerCase()} uk`,
      `buy ${category.name.toLowerCase()}`,
      "fab defense",
    ],
    noindex: page ? page > 1 : false,
  };
}

export function generateSearchMeta(query: string): PageMeta {
  return {
    title: `Search results for "${query}" | ${SITE_NAME}`,
    description: `Search results for "${query}" at ${SITE_NAME}.`,
    canonical: `${SITE_URL}/search?q=${encodeURIComponent(query)}`,
    noindex: true,
  };
}
