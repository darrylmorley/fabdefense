import type { ProductForCard } from "@/types";

interface Props {
  product: ProductForCard;
  loading?: "lazy" | "eager";
}

const formatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export default function ProductCard({ product, loading = "lazy" }: Props) {
  const imageUrl =
    product.images?.[0]?.mediumUrl ??
    product.images?.[0]?.thumbnailUrl ??
    "/placeholder.svg";

  const inStock = product.qoh > 0;

  return (
    <a
      href={`/product/${product.slug}`}
      className="group flex flex-col bg-content-surface overflow-hidden border border-content-border hover:border-content-border-hover transition-all duration-300 shadow-sm hover:shadow-md"
    >
      {/* Image area with pedestal shadow */}
      <div className="aspect-square bg-white p-4 overflow-hidden flex items-center justify-center">
        <img
          src={imageUrl}
          alt={product.name}
          width={300}
          height={300}
          loading={loading}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
        />
      </div>

      {/* Info area */}
      <div className="flex flex-col flex-1 p-4 border-t border-content-border">
        <h3 className="text-content-text font-body font-medium text-base line-clamp-2 mb-auto">
          {product.name}
        </h3>

        {/* Price display */}
        <div className="flex items-baseline gap-2 mt-3">
          {product.onSale ? (
            <>
              <span className="text-content-text font-bold text-lg font-mono">
                {formatter.format(product.salePrice)}
              </span>
              <span className="text-content-text-muted line-through text-sm font-mono">
                {formatter.format(product.price)}
              </span>
            </>
          ) : (
            <span className="text-content-text font-bold text-lg font-mono">
              {formatter.format(product.price)}
            </span>
          )}
        </div>

        {/* Stock indicator */}
        <div className="mt-2">
          {inStock ? (
            <span className="inline-flex items-center gap-1.5 bg-fab-aqua/10 text-fab-aqua-hover text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-fab-aqua" />
              In Stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-500 text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Out of Stock
            </span>
          )}
        </div>

        {/* View Details CTA */}
        <div className="mt-3 border-2 border-content-text/15 group-hover:border-fab-aqua group-hover:bg-fab-aqua text-content-text group-hover:text-white text-center text-xs font-bold uppercase tracking-wider py-2.5 transition-all duration-300">
          View Details
        </div>
      </div>
    </a>
  );
}
