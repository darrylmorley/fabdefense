export interface WebSiteItem {
  name: string;
  url?: string;
  description?: string;
  alternateName?: string;
  author?: string;
  publisher?: {
    name: string;
    url?: string;
    logo?: string;
  };
  potentialAction?: {
    target: string;
    queryInput?: string;
  };
  inLanguage?: string;
  copyrightYear?: number;
  copyrightHolder?: string;
}

export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url?: string;
  description?: string;
  alternateName?: string;
  author?: {
    '@type': 'Organization' | 'Person';
    name: string;
    url?: string;
  };
  publisher?: {
    '@type': 'Organization';
    name: string;
    url?: string;
    logo?: string;
  };
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input'?: string;
  };
  inLanguage?: string;
  copyrightYear?: number;
  copyrightHolder?: {
    '@type': 'Organization';
    name: string;
  };
}

/**
 * Generates Schema.org WebSite structured data
 * @param website - WebSite information
 * @returns JSON string of the website schema
 */
export function generateWebSiteSchema(website: WebSiteItem): string {
  const websiteSchema: WebSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: website.name,
  };

  if (website.url) {
    websiteSchema.url = website.url;
  }

  if (website.description) {
    websiteSchema.description = website.description;
  }

  if (website.alternateName) {
    websiteSchema.alternateName = website.alternateName;
  }

  if (website.author) {
    websiteSchema.author = {
      '@type': 'Organization',
      name: website.author,
    };
  }

  if (website.publisher) {
    websiteSchema.publisher = {
      '@type': 'Organization',
      ...website.publisher,
    };
  }

  if (website.potentialAction) {
    websiteSchema.potentialAction = {
      '@type': 'SearchAction',
      target: website.potentialAction.target,
      'query-input': website.potentialAction.queryInput || 'required name=search_term_string',
    };
  }

  if (website.inLanguage) {
    websiteSchema.inLanguage = website.inLanguage;
  }

  if (website.copyrightYear) {
    websiteSchema.copyrightYear = website.copyrightYear;
  }

  if (website.copyrightHolder) {
    websiteSchema.copyrightHolder = {
      '@type': 'Organization',
      name: website.copyrightHolder,
    };
  }

  return JSON.stringify(websiteSchema);
}

/**
 * Astro script template for injecting website schema
 * Use with define:vars in Astro components
 */
export const websiteSchemaScript = (websiteLdJson: string) => `
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = ${JSON.stringify(websiteLdJson)};
  document.head.appendChild(script);
`;
