import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { generateBreadcrumbSchema } from "@/schemas";
import { config } from "@/config/config";

export const metadata: Metadata = {
  title: "Privacy Policy | FAB Defense UK",
  description:
    "Read the FAB Defense UK privacy policy. Learn how we collect, use, and protect your personal data in compliance with GDPR.",
  alternates: {
    canonical: `${config.siteUrl}/privacy-policy`,
  },
};

export default function PrivacyPolicyPage() {
  const breadcrumbLdJson = generateBreadcrumbSchema([
    { name: "Home", href: config.siteUrl },
    { name: "Privacy Policy", href: `${config.siteUrl}/privacy-policy` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbLdJson }} />

      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Privacy Policy", href: "/privacy-policy" },
        ]}
        title="FAB Defense Privacy Policy"
      />

      <div className="bg-white tactical-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="font-heading text-3xl md:text-4xl font-black uppercase tracking-tight text-content-text mb-4">
            Our Privacy Promise
          </h2>

          <h3 className="font-heading text-content-text font-bold uppercase tracking-wider mb-4">
            Privacy Policy Links
          </h3>
          <ul>
            <li><a href="#privacy" className="hover:text-fab-aqua">Privacy</a></li>
            <li><a href="#cookies" className="hover:text-fab-aqua">Cookies</a></li>
            <li><a href="#payment" className="hover:text-fab-aqua">Payment Security</a></li>
            <li><a href="#phone-orders" className="hover:text-fab-aqua">Telephone Orders</a></li>
            <li><a href="#access-request" className="hover:text-fab-aqua">Right of access request</a></li>
            <li><a href="#erasure-request" className="hover:text-fab-aqua">Right of erasure request</a></li>
          </ul>

          <p className="mt-4">
            We analyse traffic to this website to help us improve both what we do as a business and the site
            itself – we want your experience of the site to run as smoothly as possible. Rest assured, we only
            collect anonymous, aggregate statistics – nothing that could identify anyone personally.
          </p>
          <p className="my-1">
            We comply with the General Data Protection Regulation (GDPR), and we don&apos;t sell or pass your
            details on to anyone else for marketing purposes. The only third parties who receive your contact
            information are our couriers and payment providers, for the sole purpose of fulfilling your order.
          </p>
          <p className="my-1">
            We do not use your details for marketing purposes without your express consent, and you can
            unsubscribe from our emails at any point using the link in the email. If you object to us using
            your data in any capacity, please contact us{" "}
            <a href="mailto:info@fabdefense.co.uk" className="hover:text-fab-aqua">
              info@fabdefense.co.uk
            </a>.
          </p>

          <div className="my-8">
            <h2 id="cookies" className="mb-2 mt-4 text-2xl font-bold">Cookies</h2>
            <p className="my-1">
              We use cookies to improve your ordering experience. Cookies are tiny text files downloaded on to
              your computer, tablet or smartphone when you visit a website. They help us remember you and enable
              you to use certain features of the site, like saving items in your cart and returning to them later
              (after payday, perhaps). Cookies only give us access to information you provide, and you can
              restrict or disable cookies through your internet browser, however this would hinder your use of
              this website.
            </p>
          </div>

          <div className="my-8">
            <h2 id="payment" className="mb-2 mt-4 text-2xl font-bold">Payment Security</h2>
            <p className="my-1">
              All transactions are processed securely by our merchant service provider. Your credit card number
              will be encrypted when your order is placed using SSL encryption software. Our merchant provider
              then informs us, the outcome of that transaction via the encryption system.
            </p>
          </div>

          <div className="my-8">
            <h2 id="phone-orders" className="mb-2 mt-4 text-2xl font-bold">Telephone Orders</h2>
            <p className="my-1">
              We do not store any credit or debit card details after your telephone order has been placed. Once
              used for the purpose of processing your order all financial details are destroyed.
            </p>
          </div>

          <div className="my-8">
            <h2 id="access-request" className="mb-2 mt-4 text-2xl font-bold">Right of access request</h2>
            <p className="my-1">
              If you would like a copy of the personal data that we have for you, please email{" "}
              <a href="mailto:info@fabdefense.co.uk" className="hover:text-secondary text-gray-800">
                info@fabdefense.co.uk
              </a>
            </p>
            <p className="my-1">
              We will provide this information free of charge within one month of receiving your request.
            </p>
          </div>

          <div className="my-8">
            <h2 id="erasure-request" className="mb-2 mt-4 text-2xl font-bold">Right of erasure request</h2>
            <p className="my-1">
              You have the right to have all the personal data that we have for you erased. Please bear in mind
              that this will remove you from our mailing lists and customer database completely – so if products
              you have bought from us are still within their warranty period, having your data erased may make
              it harder to address any future issues.
            </p>
            <p className="my-1">
              If you would like to have your data erased, please contact{" "}
              <a href="mailto:info@fabdefense.co.uk" className="hover:text-secondary text-gray-800">
                info@fabdefense.co.uk
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
