import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { generateBreadcrumbSchema } from "@/schemas";
import { config } from "@/config/config";

export const metadata: Metadata = {
  title: "Warranty | FAB Defense UK",
  description:
    "Find out more about the warranty coverage for all FAB Defense tactical accessories.",
  alternates: {
    canonical: `${config.siteUrl}/warranty`,
  },
};

export default function WarrantyPage() {
  const breadcrumbLdJson = generateBreadcrumbSchema([
    { name: "Home", href: config.siteUrl },
    { name: "Warranty", href: `${config.siteUrl}/warranty` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbLdJson }} />

      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Warranty", href: "/warranty" },
        ]}
        title="FAB Defense Warranty Information"
      />

      <div className="bg-white tactical-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="font-heading text-3xl md:text-4xl font-black uppercase tracking-tight text-content-text mb-4">
            Warranty Coverage
          </h2>
          <p className="font-body">
            Subject to the provisions, conditions and limitations set forth
            below, FAB DEFENSE will, at its sole discretion, either repair or
            replace any part of its products found and proven to be defective by
            reason of improper workmanship.
          </p>
          <p className="font-body mt-3">
            FAB DEFENSE will provide repair parts or replacement products on an
            exchange basis, and such parts shall be either new or refurbished,
            provided they are functionally equivalent to new parts.
          </p>
          <p className="font-body mt-3">
            In the event that FAB DEFENSE is unable to repair or replace the
            defective product, it will refund the current value of the product
            at the time the warranty claim was made.
          </p>
          <p className="font-body mt-3">
            This limited lifetime warranty shall not cover any damage inflicted
            on this product as a result of improper installation, accident,
            abuse, misuse, natural disaster or modification. This lifetime
            warranty shall not apply to any product that had been sold as
            used/second-hand or that had been resold.
          </p>
          <p className="font-body mt-3">
            This limited lifetime warranty shall not extend to any product or
            damage to a product caused by failure to follow the instruction
            manual, through abuse or misuse or improper usage of the products.
          </p>
        </div>
      </div>
    </>
  );
}
