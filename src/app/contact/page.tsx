import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ContactForm from "@/components/contact/ContactForm";
import {
  generateBreadcrumbSchema,
  generateLocalBusinessSchema,
  generateOrganizationSchema,
} from "@/schemas";
import { config } from "@/config/config";

export const metadata: Metadata = {
  title: "Contact Us | FAB Defense UK",
  description:
    "Get in touch with FAB Defense UK. Contact our expert team for product inquiries, support, and wholesale opportunities.",
};

export default function ContactPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", href: config.siteUrl },
    { name: "Contact", href: `${config.siteUrl}/contact` },
  ]);

  const localBusinessSchema = generateLocalBusinessSchema({
    name: config.siteName,
    url: config.siteUrl,
    logo: `${config.siteUrl}/logo.png`,
    telephone: "01527831261",
    email: "info@fabdefense.co.uk",
    address: {
      streetAddress: "38 Sherwood Road",
      addressLocality: "Bromsgrove",
      postalCode: "B60 3DR",
      addressCountry: "GB",
    },
    openingHours: [
      {
        days: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "17:30",
      },
    ],
    sameAs: [
      "https://www.facebook.com/fabdefenseuk",
      "https://www.instagram.com/fabdefenseuk",
    ],
  });

  const organizationSchema = generateOrganizationSchema({
    name: config.siteName,
    url: config.siteUrl,
    logo: `${config.siteUrl}/logo.png`,
    contactPoint: {
      telephone: "01527831261",
      email: "info@fabdefense.co.uk",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
    sameAs: [
      "https://www.facebook.com/fabdefenseuk",
      "https://www.instagram.com/fabdefenseuk",
    ],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: localBusinessSchema }} />

      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
        title="Contact Us"
      />

      <div className="bg-white tactical-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <ContactForm />

            <div>
              <h2 className="font-heading text-2xl font-bold text-content-text uppercase tracking-wide mb-6">
                Get in Touch
              </h2>

              <div className="space-y-8">
                <div className="mb-6">
                  <h3 className="font-heading text-lg font-bold text-content-text uppercase tracking-wide mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-fab-aqua/10 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-fab-aqua" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-content-text">Email</p>
                        <p className="text-content-text-secondary">info@fabdefense.co.uk</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-fab-aqua/10 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-fab-aqua" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-content-text">Phone</p>
                        <p className="text-content-text-secondary">01527 831 261</p>
                        <p className="text-sm text-content-text-muted mt-1">Tue-Sat: 9:00 AM - 5:30 PM GMT</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-fab-aqua/10 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-fab-aqua" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-content-text">Address</p>
                        <p className="text-content-text-secondary">FAB Defense UK</p>
                        <p className="text-content-text-secondary">38 Sherwood Road</p>
                        <p className="text-content-text-secondary">Bromsgrove, UK</p>
                        <p className="text-content-text-secondary">B60 3DR</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-heading text-lg font-bold text-content-text uppercase tracking-wide mb-4">
                    Business Hours
                  </h3>
                  <div className="bg-content-surface border border-content-border p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-content-text">Tuesday - Saturday</span>
                        <span className="text-content-text-secondary font-medium">9:00 AM - 5:30 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-content-text">Sunday</span>
                        <span className="text-content-text-secondary font-medium">Closed</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-content-text">Monday</span>
                        <span className="text-content-text-secondary font-medium">Closed</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-lg font-bold text-content-text uppercase tracking-wide mb-4">
                    Quick Links
                  </h3>
                  <div className="space-y-3">
                    <a href="/shop" className="block text-content-text-secondary hover:text-fab-aqua transition-colors">
                      &rarr; Shop All Products
                    </a>
                    <a href="/warranty" className="block text-content-text-secondary hover:text-fab-aqua transition-colors">
                      &rarr; Warranty Information
                    </a>
                    <a href="/terms-and-conditions" className="block text-content-text-secondary hover:text-fab-aqua transition-colors">
                      &rarr; Terms &amp; Conditions
                    </a>
                    <a href="/privacy-policy" className="block text-content-text-secondary hover:text-fab-aqua transition-colors">
                      &rarr; Privacy Policy
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
