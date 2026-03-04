"use client";
import { captureClientError } from "@/lib/clientError";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  onSale: boolean;
  qoh: number;
  sku?: string;
  manufacturerName?: string;
  image?: string | null;
}

interface ProductSearchProps {
  placeholder?: string;
  className?: string;
  showResultsInline?: boolean;
}

export default function ProductSearch({
  placeholder = "SEARCH",
  className = "",
  showResultsInline = true,
}: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  });

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/products/search?q=${encodeURIComponent(query)}&limit=5`,
        );
        const data = await response.json();
        setResults(data.products || []);
        setIsOpen(data.products?.length > 0);
      } catch (error) {
        captureClientError("Search error:", error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(query.trim())}`;
    }
  };

  const handleResultClick = (product: SearchResult) => {
    window.location.href = `/product/${product.slug}`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <form onSubmit={handleSearch}>
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-content-text-muted"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(results.length > 0)}
            placeholder={placeholder}
            className="w-60 bg-content-elevated text-content-text text-xs font-medium uppercase tracking-wider pl-9 pr-3 py-2.5 border border-content-border rounded focus:outline-none focus:border-fab-aqua placeholder:text-content-text-muted transition-colors"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-fab-aqua border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </form>

      {showResultsInline && isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-content-border shadow-lg rounded-md z-50 max-h-80 overflow-y-auto">
          {results.map((product) => (
            <button
              key={product.id}
              onClick={() => handleResultClick(product)}
              className="w-full text-left px-4 py-3 hover:bg-content-surface border-b border-content-border last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-3">
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain bg-gray-50 rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-content-text line-clamp-2">
                    {product.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-content-text font-bold text-sm font-mono">
                      {product.onSale && product.salePrice
                        ? formatter.format(product.salePrice)
                        : formatter.format(product.price)}
                    </span>
                    {product.onSale && product.salePrice && (
                      <span className="text-content-text-muted line-through text-xs font-mono">
                        {formatter.format(product.price)}
                      </span>
                    )}
                  </div>
                  {product.sku && (
                    <div className="text-xs text-content-text-muted mt-1">
                      SKU: {product.sku}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
          <button
            onClick={handleSearch}
            className="w-full text-center px-4 py-2 bg-fab-aqua hover:bg-fab-aqua-hover text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            View all results for &quot;{query}&quot;
          </button>
        </div>
      )}
    </div>
  );
}
