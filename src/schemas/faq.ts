export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQPageSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: {
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }[];
}

/**
 * Generates Schema.org FAQPage structured data
 * @param faqs - Array of FAQ items with question and answer
 * @returns JSON string of the FAQ schema
 */
export function generateFAQSchema(faqs: FAQItem[]): string {
  const faqSchema: FAQPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return JSON.stringify(faqSchema);
}

/**
 * Astro script template for injecting FAQ schema
 * Use with define:vars in Astro components
 */
export const faqSchemaScript = (faqLdJson: string) => `
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = ${JSON.stringify(faqLdJson)};
  document.head.appendChild(script);
`;
