import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { generateFAQSchema, generateBreadcrumbSchema } from "@/schemas";
import { config } from "@/config/config";

export const metadata: Metadata = {
  title: "Frequently Asked Questions - FAB Defense UK",
  description:
    "Find answers to common questions about FAB Defense tactical accessories, shipping, returns, and product compatibility.",
};

const faqs = [
  {
    question: "What is FAB Defense?",
    answer:
      "FAB Defense is a leading manufacturer of tactical accessories and equipment for firearms, airsoft, and defense applications. With over 25 years of experience, we provide premium-quality products designed for professional use and civilian applications. See our <a href='/about' class='text-fab-aqua hover:underline'>about us</a> page for more information.",
  },
  {
    question: "Are FAB Defense products compatible with my rifle?",
    answer:
      "Most FAB Defense components are designed to meet Mil-Spec standards for AR-15, AK-47, and VZ.58 platforms, alongside dedicated chassis for the Ruger 10/22. Always verify if your specific rifle uses a Mil-Spec or Commercial diameter buffer tube before purchasing a stock to ensure a perfect fit. You can <a href='/contact' class='text-fab-aqua hover:underline'>contact our customer service team</a> with your firearm model for personalised recommendations.",
  },
  {
    question: "What makes 'Self-Healing Polymer' targets different from steel?",
    answer:
      "The FAB Defense RTS (Reactive Target System) uses a specialized composite that 'closes' after a projectile passes through. Unlike steel, these targets offer zero risk of ricochet or lead splashback, making them safe for point-blank tactical drills and indoor ranges.",
  },
  {
    question: "Can I use FAB Defense Ultimag magazines in any AR-15?",
    answer:
      "Yes, the Ultimag series is designed for compatibility with standard STANAG magazine wells. They feature 'Blue Follower' technology to prevent tilting and ensure reliable feeding, even during high-volume strings of fire.",
  },
  {
    question: "Do I need a gunsmith to install FAB Defense handguards?",
    answer:
      "Most FAB Defense handguards, like the Vanguard M-LOK series, are designed as 'drop-in' replacements that can be installed with basic tools. However, for rifles with non-standard gas blocks or proprietary barrel nuts, we recommend consulting a professional gunsmith.",
  },
  {
    question: "How do Scorpus Holsters provide retention?",
    answer:
      "The Scorpus Level 2 Retention system uses a two-stage mechanism: a pressure-activated spring that secures the trigger guard and a finger-operated release button. This ensures your sidearm stays secure during movement while allowing for a fast, natural draw.",
  },
  {
    question: "Are FAB Defense products weather-resistant?",
    answer:
      "Absolutely. Manufactured from fiberglass-reinforced polymer composites or 6061-T6 aviation-grade aluminum, FAB Defense gear is engineered to withstand extreme temperatures, UV exposure, and heavy moisture, making it ideal for the UK climate.",
  },
  {
    question: "What is the difference between a Vertical and Angled Foregrip?",
    answer:
      "Vertical Foregrips (VFG) provide a traditional handle for maximum leverage and muzzle control, while Angled Foregrips (AFG) promote a more ergonomic wrist alignment to reduce fatigue during long practical shooting sessions.",
  },
  {
    question: "Are your products legal in the UK?",
    answer:
      "Yes, all FAB Defense products sold through our UK store are fully compliant with UK laws and regulations. We only sell accessories and equipment that are legal to own and use in the United Kingdom.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "We ship within the United Kingdom only. For international orders, please contact our customer service team to discuss options and requirements for your specific country.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 14-day return policy for unused items in their original packaging. If you're not satisfied with your purchase, please contact us within 14 days of receipt to arrange a return or exchange.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Standard UK shipping typically takes 1-3 business days. All orders are dispatched within 24 hours on business days. Check our <a href='/contact' class='text-fab-aqua hover:underline'>business hours</a> for more information.",
  },
  {
    question: "Do you offer warranty on your products?",
    answer:
      "Yes, all FAB Defense products come with a manufacturer's limited lifetime warranty against defects in materials and workmanship. Please visit our <a href='/warranty' class='text-fab-aqua hover:underline'>warranty</a> page for more information.",
  },
  {
    question: "Can I get technical support for installation?",
    answer:
      "Absolutely! We provide comprehensive installation guides and technical support for all our products. You can access video tutorials on our website or contact our technical support team for personalized assistance.",
  },
  {
    question: "Do you offer discounts for bulk orders?",
    answer:
      "Yes, we offer competitive pricing for bulk orders and military/police discounts. Please contact our sales team with your requirements for a custom quote.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit/debit cards, Apple Pay, Google Pay and bank transfers. All transactions are secured with SSL encryption for your safety. For payment by bank transfer <a href='/contact' class='text-fab-aqua hover:underline'>please contact our sales team</a>.",
  },
];

export default function FAQsPage() {
  const faqLdJson = generateFAQSchema(faqs);
  const breadcrumbLdJson = generateBreadcrumbSchema([
    { name: "Home", href: config.siteUrl },
    { name: "FAQs", href: `${config.siteUrl}/faqs` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbLdJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqLdJson }} />

      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "FAQs", href: "/faqs" },
        ]}
        title="Frequently Asked Questions"
      />

      <div className="bg-white tactical-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <section className="py-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-6">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <details className="group">
                      <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                        <h3 className="text-lg font-semibold text-gray-900 pr-4">
                          {faq.question}
                        </h3>
                        <div className="shrink-0">
                          <svg
                            className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform duration-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </summary>
                      <div className="px-6 pb-6">
                        <p
                          className="text-gray-600 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                      </div>
                    </details>
                  </div>
                ))}
              </div>

              <div className="mt-16 bg-fab-navy rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
                <p className="mb-6">
                  Can&apos;t find the answer you&apos;re looking for? Our customer service
                  team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 bg-fab-aqua text-white font-semibold rounded-lg hover:bg-fab-aqua/90 transition-colors"
                  >
                    Contact Us
                  </a>
                  <a
                    href="tel:+44-1527-831261"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-fab-aqua text-fab-aqua font-semibold rounded-lg hover:bg-fab-aqua hover:text-white transition-colors"
                  >
                    Call Us
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
