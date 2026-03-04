export interface ProductItem {
  name: string;
  description?: string;
  image?: string[];
  url?: string;
  brand?: string;
  sku?: string;
  manufacturerSku?: string;
  gtin?: string;
  price?: number;
  priceCurrency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder" | "Discontinued";
  condition?: "NewCondition" | "UsedCondition" | "DamagedCondition";
  category?: string;
  manufacturer?: string;
  material?: string;
  weight?: number;
  shippingRates?: {
    mainlandUK: number;
    northernIreland: number;
  };
  offers?: {
    price: number;
    priceCurrency: string;
    availability: "InStock" | "OutOfStock" | "PreOrder" | "Discontinued";
    url?: string;
    seller?: string;
    priceValidUntil?: string;
  }[];
}

export interface ProductSchema {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description?: string;
  image?: string[];
  url?: string;
  brand?: {
    "@type": "Brand";
    name: string;
  };
  sku?: string;
  gtin?: string;
  mpn?: string;
  offers?: {
    "@type": "Offer";
    price: number;
    priceCurrency: string;
    availability: string;
    url?: string;
    priceValidUntil?: string;
    hasMerchantReturnPolicy?: {
      "@type": "MerchantReturnPolicy";
      applicableCountry: string;
      returnPolicyCategory: string;
      merchantReturnDays: number;
      returnMethod: string;
      returnFees: string;
    };
    seller?: {
      "@type": "Organization";
      name: string;
    };
  }[];
  category?: string;
  manufacturer?: {
    "@type": "Organization";
    name: string;
  };
  material?: string;
  weight?: {
    "@type": "QuantitativeValue";
    value: number;
    unitCode: string;
  };
}

/**
 * Generates Schema.org Product structured data
 * @param product - Product information
 * @returns JSON string of the product schema
 */
export function generateProductSchema(product: ProductItem): string {
  const productSchema: ProductSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
  };

  if (product.description) {
    productSchema.description = product.description;
  }

  if (product.image) {
    productSchema.image = product.image;
  }

  if (product.url) {
    productSchema.url = product.url;
  }

  if (product.brand) {
    productSchema.brand = {
      "@type": "Brand",
      name: product.brand,
    };
  }

  if (product.sku) {
    productSchema.sku = product.sku.replace(/\s+/g, '-');
  }

  if (product.manufacturerSku) {
    productSchema.mpn = product.manufacturerSku;
  }

  if (product.gtin) {
    productSchema.gtin = product.gtin;
  }

  if (product.offers) {
    productSchema.offers = product.offers.map((offer) => ({
      "@type": "Offer",
      price: offer.price,
      priceCurrency: offer.priceCurrency,
      availability: `https://schema.org/${offer.availability}`,
      ...(offer.url && { url: offer.url }),
      ...(offer.priceValidUntil && { priceValidUntil: offer.priceValidUntil }),
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "GB",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
      },
      ...(offer.seller && {
        seller: {
          "@type": "Organization",
          name: offer.seller,
        },
      }),
      itemCondition: "https://schema.org/NewCondition",
      ...(product.shippingRates && {
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: product.shippingRates.mainlandUK,
            currency: "GBP",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            businessDays: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "https://schema.org/Tuesday",
                "https://schema.org/Wednesday",
                "https://schema.org/Thursday",
                "https://schema.org/Friday",
                "https://schema.org/Saturday",
              ],
            },
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 1,
              maxValue: 2,
              unitCode: "DAY",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 1,
              maxValue: 3,
              unitCode: "DAY",
            },
          },
          shippingDestination: [
            {
              "@type": "DefinedRegion",
              addressCountry: "GB",
              addressRegion: "GB",
            },
          ],
        },
      }),
    }));
  }

  if (product.category) {
    productSchema.category = product.category;
  }

  if (product.manufacturer) {
    productSchema.manufacturer = {
      "@type": "Organization",
      name: product.manufacturer,
    };
  }

  if (product.material) {
    productSchema.material = product.material;
  }

  if (product.weight) {
    productSchema.weight = {
      "@type": "QuantitativeValue",
      value: product.weight,
      unitCode: "KGM", // Kilograms
    };
  }

  return JSON.stringify(productSchema);
}

/**
 * Astro script template for injecting product schema
 * Use with define:vars in Astro components
 */
export const productSchemaScript = (productLdJson: string) => `
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = ${JSON.stringify(productLdJson)};
  document.head.appendChild(script);
`;
