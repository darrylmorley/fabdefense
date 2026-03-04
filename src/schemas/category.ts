export interface CategoryItem {
  name: string;
  description?: string;
  url?: string;
  image?: string;
  parentCategory?: string;
}

export interface CategorySchema {
  '@context': 'https://schema.org';
  '@type': 'Category';
  name: string;
  description?: string;
  url?: string;
  image?: string;
  parentItem?: {
    '@type': 'Category';
    name: string;
    url?: string;
  };
}

/**
 * Generates Schema.org Category structured data
 * @param category - Category information
 * @returns JSON string of the category schema
 */
export function generateCategorySchema(category: CategoryItem): string {
  const categorySchema: CategorySchema = {
    '@context': 'https://schema.org',
    '@type': 'Category',
    name: category.name,
  };

  if (category.description) {
    categorySchema.description = category.description;
  }

  if (category.url) {
    categorySchema.url = category.url;
  }

  if (category.image) {
    categorySchema.image = category.image;
  }

  if (category.parentCategory) {
    categorySchema.parentItem = {
      '@type': 'Category',
      name: category.parentCategory,
    };
  }

  return JSON.stringify(categorySchema);
}

/**
 * Astro script template for injecting category schema
 * Use with define:vars in Astro components
 */
export const categorySchemaScript = (categoryLdJson: string) => `
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = ${JSON.stringify(categoryLdJson)};
  document.head.appendChild(script);
`;
