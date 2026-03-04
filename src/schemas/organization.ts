export interface OrganizationItem {
  name: string;
  description?: string;
  url?: string;
  logo?: string;
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    email?: string;
    availableLanguage?: string[];
  };
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  socialMedia?: {
    platform: string;
    url: string;
  }[];
  foundingDate?: string;
  legalName?: string;
  taxId?: string;
  vatId?: string;
  sameAs?: string[];
}

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  description?: string;
  url?: string;
  logo?: string;
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone?: string;
    contactType?: string;
    email?: string;
    availableLanguage?: string[];
  };
  address?: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  sameAs?: string[];
  foundingDate?: string;
  legalName?: string;
  taxId?: string;
  vatId?: string;
}

/**
 * Generates Schema.org Organization structured data
 * @param organization - Organization information
 * @returns JSON string of the organization schema
 */
export function generateOrganizationSchema(organization: OrganizationItem): string {
  const organizationSchema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organization.name,
  };

  if (organization.description) {
    organizationSchema.description = organization.description;
  }

  if (organization.url) {
    organizationSchema.url = organization.url;
  }

  if (organization.logo) {
    organizationSchema.logo = organization.logo;
  }

  if (organization.contactPoint) {
    organizationSchema.contactPoint = {
      '@type': 'ContactPoint',
      ...organization.contactPoint,
    };
  }

  organizationSchema.address = {
    '@type': 'PostalAddress',
    streetAddress: '38 Sherwood Road',
    addressLocality: 'Bromsgrove',
    postalCode: 'B60 3DR',
    addressCountry: 'GB',
    ...(organization.address || {}),
  };

  if (organization.socialMedia) {
    organizationSchema.sameAs = organization.socialMedia.map(social => social.url);
  }

  if (organization.sameAs) {
    organizationSchema.sameAs = [
      ...(organizationSchema.sameAs || []),
      ...organization.sameAs,
    ];
  }

  if (organization.foundingDate) {
    organizationSchema.foundingDate = organization.foundingDate;
  }

  if (organization.legalName) {
    organizationSchema.legalName = organization.legalName;
  }

  if (organization.taxId) {
    organizationSchema.taxId = organization.taxId;
  }

  if (organization.vatId) {
    organizationSchema.vatId = organization.vatId;
  }

  return JSON.stringify(organizationSchema);
}

/**
 * Astro script template for injecting organization schema
 * Use with define:vars in Astro components
 */
export const organizationSchemaScript = (organizationLdJson: string) => `
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = ${JSON.stringify(organizationLdJson)};
  document.head.appendChild(script);
`;
