import { prisma } from "../prisma";
import { FAB_DEFENSE_MANUFACTURER_ID } from "../../config/config";
import { HIDDEN_CATEGORY_IDS } from "../constants";
import { logger } from "../logging/logger";

export async function getCategories() {
  try {
    const categories = await prisma.categories.findMany({
      where: {
        lightspeedID: { notIn: HIDDEN_CATEGORY_IDS },
        OR: [{ parentID: null }, { parentID: 0 }],
        products: {
          some: {
            manufacturerID: FAB_DEFENSE_MANUFACTURER_ID,
            archived: false,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return categories;
  } catch (error) {
    logger.error(error, "Error fetching categories:");
    return [];
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const category = await prisma.categories.findFirst({
      where: {
        slug,
        lightspeedID: { notIn: HIDDEN_CATEGORY_IDS },
      },
    });

    return category;
  } catch (error) {
    logger.error(error, "Error fetching category by slug:");
    return null;
  }
}

export async function getSubcategories(parentLightspeedID: number) {
  try {
    const subcategories = await prisma.categories.findMany({
      where: {
        parentID: parentLightspeedID,
        lightspeedID: { notIn: HIDDEN_CATEGORY_IDS },
        products: {
          some: {
            manufacturerID: FAB_DEFENSE_MANUFACTURER_ID,
            archived: false,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return subcategories;
  } catch (error) {
    logger.error(error, "Error fetching subcategories:");
    return [];
  }
}

export async function getCategoriesWithImages() {
  try {
    const categories = await prisma.categories.findMany({
      where: {
        lightspeedID: { notIn: HIDDEN_CATEGORY_IDS },
        products: {
          some: {
            manufacturerID: FAB_DEFENSE_MANUFACTURER_ID,
            archived: false,
            images: { some: {} },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return categories;
  } catch (error) {
    logger.error(error, "Error fetching categories with images:");
    return [];
  }
}

export async function getCategoriesGrouped() {
  try {
    const categories = await prisma.categories.findMany({
      where: {
        lightspeedID: { notIn: HIDDEN_CATEGORY_IDS },
        products: {
          some: {
            manufacturerID: FAB_DEFENSE_MANUFACTURER_ID,
            archived: false,
            images: { some: {} },
          },
        },
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                manufacturerID: FAB_DEFENSE_MANUFACTURER_ID,
                archived: false,
                images: { some: {} },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Separate into parent and child categories
    const parentMap = new Map<number, typeof categories>();
    const topLevel: typeof categories = [];

    for (const cat of categories) {
      if (!cat.parentID || cat.parentID === 0) {
        topLevel.push(cat);
      } else {
        const siblings = parentMap.get(cat.parentID) || [];
        siblings.push(cat);
        parentMap.set(cat.parentID, siblings);
      }
    }

    // Build grouped structure: top-level categories with their subcategories
    const grouped: {
      parent: (typeof categories)[0];
      children: typeof categories;
    }[] = [];
    const usedIds = new Set<number>();

    for (const parent of topLevel) {
      const children = parentMap.get(parent.lightspeedID) || [];
      grouped.push({ parent, children });
      usedIds.add(parent.lightspeedID);
      for (const child of children) {
        usedIds.add(child.lightspeedID);
      }
    }

    // Orphaned subcategories whose parent isn't in our filtered list — show as top-level
    for (const cat of categories) {
      if (!usedIds.has(cat.lightspeedID)) {
        grouped.push({ parent: cat, children: [] });
      }
    }

    grouped.sort((a, b) => a.parent.name.localeCompare(b.parent.name));

    return grouped;
  } catch (error) {
    logger.error(error, "Error fetching grouped categories:");
    return [];
  }
}
