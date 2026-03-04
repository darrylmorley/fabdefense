import heroImage from "@/assets/images/fab-defense-ultimag_2.webp";

export default function Hero() {
  return (
    <section className="relative min-h-125 max-h-200 flex items-center overflow-hidden bg-white py-16 md:py-20">
      {/* Content — two columns */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text */}
          <div>
            {/* Eyebrow */}
            <p className="text-fab-aqua font-body font-bold uppercase tracking-[0.2em] text-sm mb-4">
              Official UK Retailer
            </p>

            {/* Main heading */}
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.9] text-content-text">
              <span className="block">Tactical</span>
              <span className="block">Accessories</span>
              <span className="block text-fab-aqua">Built to Last</span>
            </h1>

            <p className="text-content-text-secondary text-lg mt-6 max-w-lg font-body">
              Elevate your platform with FAB Defense. Engineering premium ergonomics
              and stability for the UK&apos;s professionals, competitors, and shooting
              enthusiasts.
            </p>

            <div className="flex items-center gap-4 mt-8">
              <a
                href="/shop"
                className="inline-block bg-fab-aqua hover:bg-fab-aqua-hover text-white font-bold uppercase tracking-wider px-8 py-3.5 transition-colors text-sm"
              >
                Shop Now
              </a>
              <a
                href="/about"
                className="inline-block border-2 border-content-text/20 hover:border-content-text text-content-text font-bold uppercase tracking-wider px-8 py-3.5 transition-colors text-sm"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right — Image with deck effect */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Back card (rotated) */}
              <div className="absolute inset-0 bg-fab-aqua border border-fab-aqua/30 rotate-5 translate-x-3 -translate-y-2 shadow-sm w-150 h-100"></div>

              {/* Middle card (slight rotation) */}
              <div className="absolute inset-0 bg-fab-dark-gray border border-content-border -rotate-3 shadow-sm w-150 h-100"></div>

              {/* Front card */}
              <div className="relative bg-white border border-content-border rotate-3 shadow-md flex items-center justify-center w-150 h-100">
                <div className="w-full h-full">
                  <img
                    src={heroImage.src}
                    alt="Ultimag on ice!"
                    width={800}
                    height={800}
                    loading="eager"
                    className="object-fill w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
