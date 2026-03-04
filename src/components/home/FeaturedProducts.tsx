import type { ProductForCard } from "@/types";
import ProductCard from "@/components/product/ProductCard";

interface Props {
  products: ProductForCard[];
}

export default function FeaturedProducts({ products }: Props) {
  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="font-heading text-3xl md:text-4xl font-black uppercase tracking-tight text-content-text mb-2">
        Featured Products
      </h2>
      <div className="w-16 h-1 bg-fab-aqua mb-10"></div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-content-text-muted">
          Check back soon for featured products.
        </p>
      )}
    </section>
  );
}
