import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/ui/PageHeader";
import VideoGallery from "@/components/media/VideoGallery";
import { config } from "@/config/config";

export const metadata: Metadata = {
  title: "Media Gallery | FAB Defense UK",
  description:
    "Immerse yourself in the world of FAB Defense with our collection of product videos and images. Bringing innovation and excellence to every shot.",
  alternates: {
    canonical: `${config.siteUrl}/media`,
  },
};

const images = [
  {
    src: "/images/FAB-RAPS-1.webp",
    alt: "FAB Defense RAPS — Credit SourceOutdoors",
  },
  {
    src: "/images/FAB-RAPS-2.webp",
    alt: "FAB Defense RAPS — Credit SourceOutdoors",
  },
  { src: "/images/PODIUM.webp", alt: "FAB Defense Podium — Credit Polenar" },
  {
    src: "/images/MAGAZINE.webp",
    alt: "FAB Defense Buttstock & Magazine — Credit Polenar",
  },
  {
    src: "/images/KITTED.webp",
    alt: "FAB Defense Buttstock, Magazine Grip & Foregrip — Credit YD",
  },
  {
    src: "/images/M4-KITTED.webp",
    alt: "Fully FAB Kitted M4 — Credit Yaskin Arkadi",
  },
];

export default function MediaPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Media", href: "/media" },
        ]}
        title="Media Gallery"
        description="Product videos and images from FAB Defense."
      />

      <div className="bg-content-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          {/* Videos */}
          <section>
            <h2 className="font-heading text-2xl font-bold text-content-text uppercase tracking-wide mb-6">
              Videos
            </h2>
            <VideoGallery />
          </section>

          {/* Images */}
          <section>
            <h2 className="font-heading text-2xl font-bold text-content-text uppercase tracking-wide mb-6">
              Images
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div
                  key={image.src}
                  className="relative aspect-video overflow-hidden bg-fab-charcoal"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
