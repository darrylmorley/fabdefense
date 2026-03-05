import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import ProductGrid from "@/components/product/ProductGrid";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { getProductBySlug, getRelatedProducts } from "@/lib/api/products";
import { deliveryCache } from "@/lib/cache/delivery-cache";
import { generateProductSchema, generateBreadcrumbSchema } from "@/schemas";
import { config } from "@/config/config";
import { sanitizeDescription } from "@/lib/utils/sanitize";
import { isMagazineProduct } from "@/lib/delivery";
import type { ProductForCard } from "@/types";

const formatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found | FAB Defense UK" };

  return {
    title: `${product.name} | FAB Defense UK`,
    description:
      product.metaDescription ||
      product.shortDescription ||
      `${product.name} from FAB Defense. Premium tactical accessory available from the official UK retailer.`,
    alternates: {
      canonical: `${config.siteUrl}/product/${product.slug}`,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) redirect("/");

  const [relatedProducts, deliveryPrices] = await Promise.all([
    getRelatedProducts(product.id, product.categoryID),
    deliveryCache.getDeliveryPrices(),
  ]);

  const currentPrice = product.onSale ? product.salePrice : product.price;
  const images = product.images || [];
  const inStock = product.qoh > 0;
  const isNIMagazineRestricted = isMagazineProduct(product.categoryID);
  const categoryName = product.categories?.name || "Products";
  const categorySlug = product.categories?.slug || "";
  const manufacturerName = product.manufacturers?.name || null;
  const shortDescription = product.shortDescription || null;
  const longDescription = product.longDescription || null;
  const description = shortDescription || longDescription || null;

  const relatedCards: ProductForCard[] = relatedProducts.map((p) => ({
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

  const productUrl = `${config.siteUrl}/product/${product.slug}`;
  const allImages = images
    .map((img) => img.largeUrl || img.mediumUrl || img.thumbnailUrl)
    .filter((url): url is string => Boolean(url));

  const priceValidUntil = new Date(new Date().getFullYear() + 1, 0, 1)
    .toISOString()
    .split("T")[0];

  const productSchemaLdJson = generateProductSchema({
    name: product.name,
    description:
      description ||
      `${product.name} from FAB Defense. Premium tactical accessory.`,
    image: allImages.length > 0 ? allImages : undefined,
    url: productUrl,
    brand: "FAB Defense",
    sku: product.sku || "",
    manufacturerSku: product.manufacturerSku || undefined,
    gtin: product.gtin || undefined,
    category: categoryName,
    manufacturer: manufacturerName || undefined,
    shippingRates: {
      mainlandUK: deliveryPrices.mainlandUK,
      northernIreland: deliveryPrices.northernIreland,
    },
    offers: [
      {
        price: currentPrice,
        priceCurrency: "GBP",
        availability: inStock ? "InStock" : "OutOfStock",
        url: productUrl,
        seller: "FAB Defense UK",
        priceValidUntil,
      },
    ],
  });

  const breadcrumbSchemaLdJson = generateBreadcrumbSchema([
    { name: "Home", href: config.siteUrl },
    {
      name: categoryName,
      href: `${config.siteUrl}/category/${categorySlug}`,
    },
    { name: product.name, href: productUrl },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbSchemaLdJson }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: productSchemaLdJson }}
      />

      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: categoryName, href: `/category/${categorySlug}` },
          { name: product.name, href: `/product/${product.slug}` },
        ]}
      />

      <div className="bg-white tactical-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left column — Image gallery (client component for thumbnail switching) */}
            <ProductImageGallery images={images} productName={product.name} />

            {/* Right column — Product info */}
            <div className="flex flex-col">
              {manufacturerName && (
                <p className="text-fab-aqua text-xs uppercase tracking-widest mb-2 font-mono">
                  {manufacturerName}
                </p>
              )}

              <h1 className="font-heading text-2xl md:text-3xl font-black text-content-text uppercase tracking-tight leading-tight">
                {product.name}
              </h1>

              {product.sku && (
                <p className="text-content-text-muted text-sm mt-2 font-mono">
                  SKU: {product.sku}
                </p>
              )}

              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-content-text text-3xl font-bold font-mono">
                  {formatter.format(currentPrice)}
                </span>
                {product.onSale && (
                  <span className="text-content-text-muted line-through text-lg font-mono">
                    {formatter.format(product.price)}
                  </span>
                )}
              </div>

              <div className="mt-4">
                {inStock ? (
                  <span className="inline-flex items-center gap-2 bg-fab-aqua/10 text-fab-aqua-hover text-xs font-mono font-bold uppercase tracking-widest px-3 py-1.5">
                    <span className="w-2 h-2 rounded-full bg-fab-aqua" />
                    In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 bg-red-50 text-red-500 text-xs font-mono font-bold uppercase tracking-widest px-3 py-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    Out of Stock
                  </span>
                )}
              </div>

              <div className="mt-8">
                <AddToCartButton
                  productId={product.id}
                  inStock={inStock}
                  name={product.name}
                  price={currentPrice}
                />
              </div>

              {isNIMagazineRestricted && (
                <div className="mt-6 flex gap-3 border border-red-300 bg-amber-50 px-4 py-3 text-sm text-red-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mt-0.5 h-4 w-4 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p>
                    <strong className="font-semibold">
                      Northern Ireland restriction:
                    </strong>{" "}
                    Due to legal requirements, this product cannot be shipped to
                    Northern Ireland (BT postcodes).
                  </p>
                </div>
              )}

              {shortDescription && (
                <div className="border-t border-content-border mt-8 pt-8">
                  {/* Short description is trusted CMS/product data from database */}
                  <div
                    className="prose max-w-none text-content-text-secondary leading-relaxed [&_h2]:text-content-text [&_h3]:text-content-text [&_strong]:text-content-text [&_a]:text-fab-aqua [&_a:hover]:text-fab-aqua-hover [&_ul]:list-disc [&_ol]:list-decimal"
                    dangerouslySetInnerHTML={{ __html: sanitizeDescription(shortDescription) }}
                  />
                </div>
              )}
            </div>
          </div>

          {longDescription && (
            <div className="mt-12 border-t border-content-border pt-8">
              <h2 className="font-heading text-xl font-black text-content-text uppercase tracking-tight mb-4">
                Product Details
              </h2>
              {/* Long description is trusted CMS/product data from database */}
              <div
                className="prose max-w-none text-content-text-secondary leading-relaxed [&_h2]:text-content-text [&_h3]:text-content-text [&_strong]:text-content-text [&_a]:text-fab-aqua [&_a:hover]:text-fab-aqua-hover [&_ul]:list-disc [&_ol]:list-decimal"
                dangerouslySetInnerHTML={{ __html: sanitizeDescription(longDescription) }}
              />
            </div>
          )}

          {relatedCards.length > 0 && (
            <section className="mt-16 md:mt-20">
              <h2 className="font-heading text-xl md:text-2xl font-black text-content-text uppercase tracking-tight mb-6">
                Related Products
              </h2>
              <ProductGrid products={relatedCards} />
            </section>
          )}
        </div>
      </div>
    </>
  );
}
