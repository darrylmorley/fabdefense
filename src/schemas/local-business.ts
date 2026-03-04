export interface OpeningHoursItem {
  days: string[];
  opens: string;
  closes: string;
}

export interface LocalBusinessItem {
  name: string;
  url?: string;
  description?: string;
  logo?: string;
  image?: string;
  telephone?: string;
  email?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode: string;
    addressCountry: string;
  };
  openingHours?: OpeningHoursItem[];
  priceRange?: string;
  sameAs?: string[];
}

export interface LocalBusinessSchema {
  '@context': 'https://schema.org';
  '@type': 'LocalBusiness';
  name: string;
  url?: string;
  description?: string;
  logo?: string;
  image?: string;
  telephone?: string;
  email?: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode: string;
    addressCountry: string;
  };
  openingHoursSpecification?: {
    '@type': 'OpeningHoursSpecification';
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }[];
  priceRange?: string;
  sameAs?: string[];
}

/**
 * Generates Schema.org LocalBusiness structured data
 * @param business - Local business information
 * @returns JSON string of the local business schema
 */
export function generateLocalBusinessSchema(business: LocalBusinessItem): string {
  const schema: LocalBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    address: {
      '@type': 'PostalAddress',
      ...business.address,
    },
  };

  if (business.url) schema.url = business.url;
  if (business.description) schema.description = business.description;
  if (business.logo) schema.logo = business.logo;
  if (business.image) schema.image = business.image;
  if (business.telephone) schema.telephone = business.telephone;
  if (business.email) schema.email = business.email;
  if (business.priceRange) schema.priceRange = business.priceRange;
  if (business.sameAs) schema.sameAs = business.sameAs;

  if (business.openingHours) {
    schema.openingHoursSpecification = business.openingHours.map((slot) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes,
    }));
  }

  return JSON.stringify(schema);
}

/**
 * Astro script template for injecting local business schema
 * Use with define:vars in Astro components
 */
export const localBusinessSchemaScript = (ldJson: string) => `
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = ${JSON.stringify(ldJson)};
  document.head.appendChild(script);
`;
