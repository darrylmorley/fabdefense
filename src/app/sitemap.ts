import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { FAB_DEFENSE_MANUFACTURER_ID } from "@/config/config";
import { HIDDEN_CATEGORY_IDS } from "@/lib/constants";

const SITE_URL = process.env.PUBLIC_SITE_URL || "https://www.fabdefense.co.uk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.products.findMany({
      where: {
        manufacturerID: FAB_DEFENSE_MANUFACTURER_ID,
        archived: { not: true },
        slug: { not: null },
        images: { some: {} },
        categoryID: { notIn: HIDDEN_CATEGORY_IDS },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.categories.findMany({
      where: {
        products: {
          some: {
            manufacturerID: FAB_DEFENSE_MANUFACTURER_ID,
            archived: { not: true },
            images: { some: {} },
            categoryID: { notIn: HIDDEN_CATEGORY_IDS },
          },
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    }),
  ]);

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/category/${cat.slug}`,
    lastModified: cat.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => p.slug)
    .map((product) => ({
      url: `${SITE_URL}/product/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...staticPages, ...categoryPages, ...productPages];
}
