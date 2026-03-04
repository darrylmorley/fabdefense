export interface ItemListProductItem {
  position: number;
  url: string;
  name: string;
  image?: string;
  price?: number;
  priceCurrency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder" | "Discontinued";
}

export interface ItemListLinkItem {
  position: number;
  name: string;
  url: string;
}

export interface ItemListItem {
  name: string;
  url?: string;
  description?: string;
  numberOfItems?: number;
  items: ItemListProductItem[] | ItemListLinkItem[];
}

export interface ItemListSchema {
  "@context": "https://schema.org";
  "@type": "ItemList";
  name: string;
  url?: string;
  description?: string;
  numberOfItems?: number;
  itemListElement: object[];
}

/**
 * Generates Schema.org ItemList structured data for a list of links (e.g. category index)
 * @param list - ItemList information with simple link items
 * @returns JSON string of the ItemList schema
 */
export function generateItemListSchema(list: ItemListItem): string {
  const schema: ItemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: list.name,
    itemListElement: list.items.map((item) => {
      const base = {
        "@type": "ListItem",
        position: item.position,
        name: item.name,
        url: item.url,
      };

      const productItem = item as ItemListProductItem;
      if (productItem.price !== undefined) {
        return {
          ...base,
          item: {
            "@type": "Product",
            name: item.name,
            url: item.url,
            ...(productItem.image && { image: productItem.image }),
            offers: {
              "@type": "Offer",
              price: productItem.price,
              priceCurrency: productItem.priceCurrency ?? "GBP",
              availability: `https://schema.org/${productItem.availability ?? "InStock"}`,
            },
          },
        };
      }

      return base;
    }),
  };

  if (list.url) schema.url = list.url;
  if (list.description) schema.description = list.description;
  if (list.numberOfItems !== undefined) schema.numberOfItems = list.numberOfItems;

  return JSON.stringify(schema);
}

/**
 * Astro script template for injecting ItemList schema
 * Use with define:vars in Astro components
 */
export const itemListSchemaScript = (ldJson: string) => `
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = ${JSON.stringify(ldJson)};
  document.head.appendChild(script);
`;
