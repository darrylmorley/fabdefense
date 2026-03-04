import type { ProductForCard } from "@/types";
import ProductCard from "@/components/product/ProductCard";

interface Props {
  products: ProductForCard[];
}

export default function ProductGrid({ products }: Props) {
  if (products.length > 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 md:mb-12">
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            loading={i < 4 ? "eager" : "lazy"}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16 text-content-border mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
      <p className="text-content-text-secondary text-lg font-medium">
        No products found
      </p>
      <p className="text-content-text-muted text-sm mt-1">
        Try adjusting your filters or check back later.
      </p>
    </div>
  );
}
