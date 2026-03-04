import Image from "next/image";
import gripsImage from "@/assets/images/fab-defense-grips-cat.png";
import bipodsImage from "@/assets/images/fab-defense-bipods-cat.png";
import magazinePouchesImage from "@/assets/images/fab-defense-holsters-cat.png";
import magazineImage from "@/assets/images/fab-defense-magazines-cat.png";
import sightsImage from "@/assets/images/fab-defense-sights-cat.png";
import buttstocksImage from "@/assets/images/fab-defense-buttstocks-cat.png";

const categories = [
  {
    name: "Grips",
    slug: "/category/grips-rifle",
    description: "Ergonomic pistol and foregrips",
    image: gripsImage,
  },
  {
    name: "Buttstocks",
    slug: "/category/buttstocks",
    description: "Adjustable tactical stocks",
    image: buttstocksImage,
  },
  {
    name: "Bipods & Rests",
    slug: "/category/bipods-rests",
    description: "Precision shooting support",
    image: bipodsImage,
  },
  {
    name: "Magazines",
    slug: "/category/magazines-rifle",
    description: "High-capacity magazines",
    image: magazineImage,
  },
  {
    name: "Sights",
    slug: "/category/sights-rifle",
    description: "Precision sighting systems",
    image: sightsImage,
  },
  {
    name: "Holsters & Pouches",
    slug: "/category/holsters",
    description: "Tactical carry solutions",
    image: magazinePouchesImage,
  },
];

export default function CategoryGrid() {
  return (
    <section className="py-16 md:py-20 bg-fab-aqua/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl md:text-4xl font-black uppercase tracking-tight text-content-text mb-2">
          Shop by Category
        </h2>
        <div className="w-16 h-1 bg-fab-aqua mb-10"></div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {categories.map((category) => (
            <a
              key={category.slug}
              href={category.slug}
              className="group relative aspect-4/3 overflow-hidden bg-content-surface border border-content-border hover:border-fab-aqua/30 transition-all duration-300"
            >
              {/* Image area */}
              <div className="absolute inset-0 bg-content-elevated group-hover:bg-content-elevated/80 transition-colors duration-300 w-100 h-100">
                <Image
                  width={400}
                  height={400}
                  src={category.image.src}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Bottom content area */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 bg-white/90 backdrop-blur-sm border-t border-content-border">
                <p className="font-mono text-fab-aqua text-[10px] uppercase tracking-widest mb-1">
                  Category
                </p>
                <h3 className="font-heading text-content-text font-bold uppercase tracking-wide text-base md:text-lg group-hover:text-fab-aqua transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="text-content-text-muted text-xs mt-1 font-body">
                  {category.description}
                </p>
              </div>

              {/* Aqua left accent */}
              <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-fab-aqua/40 group-hover:bg-fab-aqua transition-colors duration-300" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
