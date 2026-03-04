import type { Metadata } from "next";
import Image from "next/image";
import heroImage from "@/assets/images/fab-defense-uk-tactical-operations-hero.webp";
import battleProven from "@/assets/images/fab-defense-uk-battle-proven-tactical-heritage.webp";
import lawEnforcement from "@/assets/images/fab-defense-uk-law-enforcement-tactical-support.webp";
import PageHeader from "@/components/ui/PageHeader";
import { generateBreadcrumbSchema, generateOrganizationSchema } from "@/schemas";
import { config } from "@/config/config";

export const metadata: Metadata = {
  title: "About Us | FAB Defense UK",
  description:
    "Official UK retailer for FAB Defense tactical accessories. Premier distributor of world-class tactical equipment and weapon accessories for UK professionals and shooting enthusiasts.",
};

export default function AboutPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", href: config.siteUrl },
    { name: "About Us", href: `${config.siteUrl}/about` },
  ]);

  const organizationSchema = generateOrganizationSchema({
    name: config.siteName,
    url: config.siteUrl,
    logo: `${config.siteUrl}/logo.png`,
    description:
      "Official UK retailer for FAB Defense tactical accessories. Premier distributor of world-class tactical equipment and weapon accessories for UK professionals and shooting enthusiasts.",
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationSchema }} />

      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "About Us", href: "/about" },
        ]}
        title="About FAB Defense UK"
      />

      <div
        className="relative w-full h-125 bg-cover bg-center"
        style={{ backgroundImage: `url('${heroImage.src}')` }}
      >
        <div className="absolute inset-0 bg-fab-aqua/20 bg-opacity-10 flex items-center justify-center">
          <h1 className="text-white font-heading text-4xl md:text-6xl font-black uppercase tracking-tight text-center">
            PRECISION ENGINEERING. BATTLE-PROVEN HERITAGE
          </h1>
        </div>
      </div>

      <div className="bg-white tactical-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <h3 className="font-heading text-content-text font-bold uppercase tracking-wide text-base md:text-lg transition-colors duration-300">
              Precision Engineering. Battle-Proven Heritage.
            </h3>
            <div className="md:grid grid-cols-2 gap-8">
              <div>
                <p className="text-content-text-secondary text-lg mt-6 font-body">
                  Welcome to the official home of FAB Defense® in the United
                  Kingdom. At fabdefense.co.uk, we are proud to be the premier
                  distributor and leading retailer of world-class tactical equipment
                  and weapon accessories.
                </p>
                <p className="text-content-text-secondary text-lg mt-6 font-body">
                  Our mission is simple: to provide UK professionals and shooting
                  enthusiasts with the same elite-tier upgrades trusted by Special
                  Operations and SWAT units across the globe.
                </p>
              </div>
              <div>
                <Image
                  width={600}
                  height={400}
                  src={battleProven}
                  alt="FAB Defense tactical operations"
                  className="w-full h-auto object-cover rounded-lg shadow-md mt-6 md:mt-0"
                />
              </div>
            </div>
          </div>

          <div className="my-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <Image
                  width={600}
                  height={400}
                  src={heroImage}
                  alt="FAB Defense tactical operations"
                  className="w-full h-auto object-cover rounded-lg shadow-md mt-6 md:mt-0"
                />
              </div>
              <div>
                <h4 className="font-heading text-content-text font-bold uppercase tracking-wide text-base md:text-lg transition-colors duration-300 my-4">
                  Our Heritage: From Workshop to Frontline
                </h4>
                <p className="text-content-text-secondary text-lg mt-6 font-body">
                  Founded in 1969, FAB Defense® (F.A.B.®) began as a specialized
                  workshop. Over the decades, it has evolved into a global leader in
                  tactical innovation. As a family-owned business operated by
                  veterans and active-duty soldiers, the brand&apos;s DNA is rooted in
                  real-world combat experience.
                </p>
                <p className="text-content-text-secondary text-lg mt-6 font-body">
                  Every product we stock is born from this military pedigree.
                  Designed, manufactured, and assembled in modern facilities using
                  the most advanced technologies available.
                </p>
              </div>
            </div>

            <div className="my-12">
              <h3 className="font-heading text-content-text font-bold uppercase tracking-wide text-base md:text-lg transition-colors duration-300 mt-4">
                Why Choose FAB Defense UK?
              </h3>
              <p className="text-content-text-secondary text-lg mt-6 font-body">
                When you shop with us, you aren&apos;t just buying an accessory; you are
                investing in gear that has been battle-tested in the harshest
                environments on Earth.
              </p>
              <ul className="space-y-2 list-disc list-inside mt-4 font-body">
                <li className="text-lg">
                  <span className="font-bold">Elite Collaboration:</span> Our R&amp;D
                  teams work directly with Special Operations and SWAT units to solve
                  the challenges of modern tactical operations.
                </li>
                <li className="text-lg">
                  <span className="font-bold">Integrated Excellence:</span> With
                  engineering, manufacturing, and strict quality assurance all under
                  one roof, FAB Defense ensures every component meets a relentless
                  standard of excellence.
                </li>
                <li className="text-lg">
                  <span className="font-bold">Ergonomic Innovation:</span> We
                  prioritize &quot;The Human Factor.&quot; Our designs are continuously
                  refined to improve ergonomic efficiency, enhance safety, and ensure
                  peak operational readiness.
                </li>
              </ul>
            </div>

            <div className="my-12">
              <div className="md:grid grid-cols-2 gap-8">
                <div>
                  <Image
                    width={600}
                    height={400}
                    src={lawEnforcement}
                    alt="FAB Defense tactical operations"
                    className="w-full h-auto object-cover rounded-lg shadow-md mt-6 md:mt-0"
                  />
                </div>
                <div>
                  <h3 className="font-heading text-content-text font-bold uppercase tracking-wide text-base md:text-lg transition-colors duration-300 mt-4">
                    Local Expertise, Global Quality
                  </h3>
                  <p className="text-content-text-secondary text-lg mt-6 font-body">
                    As the dedicated UK distributor, we bridge the gap between
                    Israeli engineering and the British tactical community. We
                    understand the specific needs of our local market, from civilian
                    sport shooters to law enforcement professionals. And, we back
                    every sale with expert product knowledge and local support.
                  </p>
                  <p className="text-content-text-secondary text-lg mt-6 font-body">
                    &quot;We don&apos;t just sell equipment; we provide the edge you need
                    when it matters most.&quot;
                  </p>
                </div>
              </div>
            </div>

            <h3 className="font-heading text-content-text font-bold uppercase tracking-wide text-base md:text-lg transition-colors duration-300 mt-4">
              Stay Ahead of the Curve
            </h3>
            <p className="text-content-text-secondary text-lg mt-6 font-body">
              The tactical landscape is always evolving. Through our partnership
              with FAB Defense®, we remain agile and progressive, ensuring that
              the latest cutting-edge stocks, grips, and rail systems are
              available right here in the UK.
            </p>
            <p className="text-content-text-secondary text-lg mt-6 font-body">
              Experience the difference that five decades of combat-tested
              engineering makes. Equip yourself with the best.{" "}
              <a href="/shop" className="hover:text-fab-aqua underline">
                Shop All Accessories
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
