import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BrandStory from "@/components/home/BrandStory";
import { getProductsByIds } from "@/lib/api/products";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/schemas";
import { config } from "@/config/config";

export const metadata: Metadata = {
  title: "Tactical Firearms & Airsoft Accessories | FAB Defense UK",
  description:
    "Battle-tested FAB Defense tactical gear for UK shooters. From Special Ops to Rifle Clubs. World-class firearm accessories and airsoft upgrades. Shop now.",
};

// Add product IDs here to feature on the homepage
const FEATURED_PRODUCT_IDS: number[] = [7668, 726, 7485, 8690];

export default async function HomePage() {
  const featuredProducts = await getProductsByIds(FEATURED_PRODUCT_IDS);

  // Schema values come from server-side config/schema generators, not user input.
  const organizationSchema = generateOrganizationSchema({
    name: config.siteName,
    url: config.siteUrl,
    logo: `${config.siteUrl}/logo.png`,
    description:
      "Official UK retailer for FAB Defense tactical accessories. Premium firearms and airsoft accessories with over 25 years of experience.",
    contactPoint: {
      email: config.adminEmail,
      contactType: "customer service",
      availableLanguage: ["English"],
    },
    sameAs: [
      "https://www.facebook.com/fabdefenseuk",
      "https://www.instagram.com/fabdefenseuk",
    ],
  });

  const websiteSchema = generateWebSiteSchema({
    name: config.siteName,
    url: config.siteUrl,
    description:
      "Battle-tested FAB Defense tactical gear for UK shooters. From Special Ops to Rifle Clubs. World-class firearm accessories and airsoft upgrades.",
    inLanguage: "en-GB",
    potentialAction: {
      target: `${config.siteUrl}/shop?q={search_term_string}`,
      queryInput: "required name=search_term_string",
    },
  });

  return (
    <>
      {/* JSON-LD structured data — server-generated, trusted content */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: organizationSchema }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: websiteSchema }}
      />
      <Hero />
      <CategoryGrid />
      <FeaturedProducts products={featuredProducts} />
      <BrandStory />
    </>
  );
}
