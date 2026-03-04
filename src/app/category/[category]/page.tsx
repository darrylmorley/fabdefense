import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import ProductGrid from "@/components/product/ProductGrid";
import ShopFilters from "@/components/product/ShopFilters";
import LoadMoreButton from "@/components/product/LoadMoreButton";
import { getCategoryProducts, type SortOption } from "@/lib/api/products";
import { getCategoriesWithImages } from "@/lib/api/categories";
import { generateBreadcrumbSchema, generateItemListSchema } from "@/schemas";
import { config } from "@/config/config";
import type { ProductForCard } from "@/types";

const validSorts: SortOption[] = [
  "name-asc",
  "name-desc",
  "price-asc",
  "price-desc",
  "newest",
];

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { category } = await params;
  const sp = await searchParams;
  const sortParam = typeof sp.sort === "string" ? sp.sort : undefined;
  const sort: SortOption = validSorts.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : "name-asc";

  const result = await getCategoryProducts({
    categorySlug: category,
    page: 1,
    sort,
  });
  if (!result?.category) {
    return { title: "Category Not Found | FAB Defense UK" };
  }

  const { category: cat } = result;
  const categoryOverride = cat.category_overrides?.[0];
  const metaTitle = categoryOverride?.meta_title || cat.metaTitle;
  const metaDescription =
    categoryOverride?.meta_description || cat.metaDescription;

  return {
    title: metaTitle || `${cat.name} | FAB Defense UK`,
    description:
      metaDescription ||
      `Upgrade your rifle with FAB Defense ${cat.name}. Ergonomic, battle-tested equipment for AR-15, AK-47, and more. UK stock with fast shipping. Shop the range.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category } = await params;
  const sp = await searchParams;
  const sortParam = typeof sp.sort === "string" ? sp.sort : undefined;
  const sort: SortOption = validSorts.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : "name-asc";

  const [categories, result] = await Promise.all([
    getCategoriesWithImages(),
    getCategoryProducts({ categorySlug: category, page: 1, sort }),
  ]);

  if (!result || !result.category) {
    redirect("/");
  }

  const { products, total, category: cat } = result;

  const categoryOverride = cat.category_overrides?.[0];
  const categoryDescription =
    categoryOverride?.description || cat.description || "";
  const categoryIntro =
    categoryOverride?.category_intro || cat.category_intro || "";
  const metaDescription =
    categoryOverride?.meta_description || cat.metaDescription;

  const productCards: ProductForCard[] = products.map((p) => ({
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

  const hasMore = total > 24;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", href: config.siteUrl },
    { name: "Shop", href: `${config.siteUrl}/shop` },
    { name: cat.name, href: `${config.siteUrl}/category/${cat.slug}` },
  ]);

  const itemListSchema = generateItemListSchema({
    name: cat.name,
    url: `${config.siteUrl}/category/${cat.slug}`,
    description: metaDescription || undefined,
    numberOfItems: total,
    items: productCards.map((p, i) => ({
      position: i + 1,
      name: p.name,
      url: `${config.siteUrl}/product/${p.slug}`,
      image: p.images?.[0]?.mediumUrl ?? p.images?.[0]?.thumbnailUrl,
      price: p.onSale ? p.salePrice : p.price,
      priceCurrency: "GBP",
      availability: p.qoh > 0 ? "InStock" : "OutOfStock",
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbSchema }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: itemListSchema }}
      />

      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Shop", href: "/shop" },
          { name: cat.name, href: `/category/${cat.slug}` },
        ]}
        title={cat.name}
        total={total}
        description={categoryIntro}
      />

      <div className="bg-white tactical-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ShopFilters
            categories={categories}
            currentSort={sort}
            currentCategory={category}
          />

          <div id="product-grid">
            <ProductGrid products={productCards} />
          </div>

          <LoadMoreButton
            initialHasMore={hasMore}
            sort={sort}
            categorySlug={cat.slug}
          />
        </div>
      </div>

      {categoryDescription && (
        <div className="bg-content-surface border-t border-content-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Category description is trusted CMS content from database */}
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: categoryDescription }}
            />
          </div>
        </div>
      )}
    </>
  );
}
