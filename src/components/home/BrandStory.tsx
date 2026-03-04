import Image from "next/image";
import storyImage from "@/assets/images/fab-defense-the-best.jpg";

export default function BrandStory() {
  return (
    <section className="py-16 md:py-20 bg-fab-gunmetal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column — Text */}
          <div>
            <p className="text-fab-aqua font-body font-bold uppercase tracking-[0.2em] text-sm mb-4">
              About FAB Defense
            </p>

            <h2 className="font-heading text-4xl md:text-5xl font-black uppercase leading-[0.95] text-fab-white mb-6">
              Built for Those Who Demand the Best
            </h2>

            <div className="text-fab-light-gray leading-relaxed space-y-4 font-body">
              <p>
                FAB Defense is a world-renowned manufacturer of tactical gear and
                accessories. With over 25 years of experience, our products are
                designed and manufactured to the highest standards.
              </p>
              <p>
                From professional military and law enforcement to competitive
                shooters and airsoft enthusiasts, FAB Defense accessories are
                trusted worldwide for their durability, innovation and performance.
              </p>
            </div>

            <a
              href="/about"
              className="inline-block bg-fab-aqua hover:bg-fab-aqua-hover text-white font-bold uppercase tracking-wider px-8 py-3.5 mt-8 transition-colors text-sm"
            >
              Learn More
            </a>
          </div>

          {/* Right column — Image */}
          <div className="aspect-4/3 bg-fab-gunmetal/50 flex items-center justify-center">
            <Image
              src={storyImage}
              alt="Built for the best!"
              width={800}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
