export interface BreadcrumbItem {
  name: string;
  href: string;
}

export interface BreadcrumbListSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: {
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }[];
}

/**
 * Generates Schema.org BreadcrumbList structured data
 * @param items - Array of breadcrumb items with name and href
 * @returns JSON string of the breadcrumb schema
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): string {
  const breadcrumbList: BreadcrumbListSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href,
    })),
  };

  return JSON.stringify(breadcrumbList);
}

/**
 * Astro script template for injecting breadcrumb schema
 * Use with define:vars in Astro components
 */
export const breadcrumbSchemaScript = (breadcrumbLdJson: string) => `
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = ${JSON.stringify(breadcrumbLdJson)};
  document.head.appendChild(script);
`;
