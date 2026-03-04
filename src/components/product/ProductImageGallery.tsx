"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductImage {
  thumbnailUrl: string | null;
  mediumUrl: string | null;
  largeUrl: string | null;
}

interface Props {
  images: ProductImage[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const mainImage =
    images[activeIndex]?.largeUrl || images[activeIndex]?.mediumUrl || null;

  return (
    <div>
      {/* Main image */}
      <div className="aspect-square bg-content-surface border border-content-border overflow-hidden flex items-center justify-center p-6">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={productName}
            width={500}
            height={500}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-content-text-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-20 h-20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm mt-2">No image available</span>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((img, index) => {
            const thumbSrc = img.thumbnailUrl || img.mediumUrl || img.largeUrl;
            if (!thumbSrc) return null;

            return (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden border-2 bg-white p-1 cursor-pointer transition-colors duration-200 ${
                  index === activeIndex
                    ? "border-fab-aqua"
                    : "border-content-border hover:border-content-border-hover"
                }`}
              >
                <Image
                  src={thumbSrc}
                  alt={`${productName} - Image ${index + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
