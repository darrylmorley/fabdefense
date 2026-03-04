"use client";

import { useState } from "react";
import type { ProductForCard } from "@/types";
import ProductCard from "@/components/product/ProductCard";

interface Props {
  initialHasMore: boolean;
  initialPage?: number;
  sort: string;
  searchQuery?: string;
  categorySlug?: string;
}

export default function LoadMoreButton({
  initialHasMore,
  initialPage = 1,
  sort,
  searchQuery,
  categorySlug,
}: Props) {
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [extraProducts, setExtraProducts] = useState<ProductForCard[]>([]);

  async function handleLoadMore() {
    setLoading(true);
    const nextPage = page + 1;

    const params = new URLSearchParams({
      page: String(nextPage),
      sort,
    });
    if (searchQuery) params.set("q", searchQuery);
    if (categorySlug) params.set("category", categorySlug);

    try {
      const res = await fetch(`/api/products/list?${params}`);
      const data = await res.json();

      if (data.products?.length > 0) {
        setExtraProducts((prev) => [...prev, ...data.products]);
      }
      setPage(nextPage);
      setHasMore(data.hasMore);
    } catch {
      // silently fail — keep button enabled
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {extraProducts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 mt-4">
          {extraProducts.map((product) => (
            <ProductCard key={product.id} product={product} loading="lazy" />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-10 mb-4 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className="px-10 py-3 bg-fab-aqua hover:bg-fab-aqua-hover text-fab-white font-bold uppercase tracking-wider text-sm transition-colors disabled:opacity-60"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </>
  );
}
