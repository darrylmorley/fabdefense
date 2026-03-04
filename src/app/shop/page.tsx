import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ProductGrid from "@/components/product/ProductGrid";
import ShopFilters from "@/components/product/ShopFilters";
import LoadMoreButton from "@/components/product/LoadMoreButton";
import { getCategoriesWithImages } from "@/lib/api/categories";
import { getShopProducts, type SortOption } from "@/lib/api/products";
import { generateBreadcrumbSchema, generateItemListSchema } from "@/schemas";
import { config } from "@/config/config";

export const metadata: Metadata = {
  title: "Shop FAB Defense Tactical Accessories | UK Stock & Fast Shipping",
  description:
    "Browse all FAB Defense stocks, grips, rails, and more. Battle-tested tactical gear in stock and ready for UK delivery. Upgrade your rifle today!",
};

const validSorts: SortOption[] = [
  "name-asc",
  "name-desc",
  "price-asc",
  "price-desc",
  "newest",
];

const limit = 24;

// JSON-LD script tag — content is server-generated from trusted schema utilities, not user input
function JsonLd({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      /* eslint-disable-next-line react/no-danger */
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const sortParam = typeof params.sort === "string" ? params.sort : undefined;
  const sort: SortOption = validSorts.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : "name-asc";
  const searchQuery =
    typeof params.q === "string" ? params.q.trim() : "";

  const [categories, shopData] = await Promise.all([
    getCategoriesWithImages(),
    getShopProducts({ sort, searchQuery, limit }),
  ]);

  const { products: productCards, total, hasMore } = shopData;

  const breadcrumbLdJson = generateBreadcrumbSchema([
    { name: "Home", href: config.siteUrl },
    { name: "Shop", href: `${config.siteUrl}/shop` },
  ]);

  const itemListLdJson = !searchQuery
    ? generateItemListSchema({
        name: "FAB Defense Tactical Accessories",
        url: `${config.siteUrl}/shop`,
        description:
          "Browse all FAB Defense stocks, grips, rails, and more. Battle-tested tactical gear in stock and ready for UK delivery.",
        numberOfItems: total,
        items: productCards.map((p: any, i: number) => ({
          position: i + 1,
          name: p.name,
          url: `${config.siteUrl}/product/${p.slug}`,
          image: p.images?.[0]?.mediumUrl ?? p.images?.[0]?.thumbnailUrl,
          price: p.onSale ? p.salePrice : p.price,
          priceCurrency: "GBP",
          availability: p.qoh > 0 ? "InStock" : "OutOfStock",
        })),
      })
    : null;

  return (
    <>
      <JsonLd json={breadcrumbLdJson} />
      {itemListLdJson && <JsonLd json={itemListLdJson} />}

      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Shop", href: "/shop" },
        ]}
        title={
          searchQuery ? `Search Results for "${searchQuery}"` : "Shop All Products"
        }
        total={total}
        countId="product-count"
      />

      <div className="bg-white tactical-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ShopFilters
            categories={categories}
            currentSort={sort}
          />

          <div id="product-grid">
            <ProductGrid products={productCards} />
          </div>

          <LoadMoreButton
            initialHasMore={hasMore}
            sort={sort}
            searchQuery={searchQuery || undefined}
          />
        </div>
      </div>
    </>
  );
}
