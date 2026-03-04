import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white mt-auto border-t border-content-border">
      {/* Aqua accent strip at top */}
      <div className="h-1 bg-fab-aqua"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 — Brand */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <span className="font-heading text-content-text font-black text-2xl uppercase tracking-tight">
                FAB Defense
              </span>
            </Link>
            <p className="text-content-text-secondary text-base leading-relaxed font-body">
              Official UK retailer for FAB Defense tactical accessories. Over 25
              years of experience in premium firearms and airsoft accessories.
            </p>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h3 className="font-heading text-content-text font-bold uppercase tracking-wider text-sm mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/shop"
                  className="text-content-text-secondary hover:text-fab-aqua transition-colors text-sm font-body"
                >
                  Shop
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-content-text-secondary hover:text-fab-aqua transition-colors text-sm font-body"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-content-text-secondary hover:text-fab-aqua transition-colors text-sm font-body"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/privacy-policy"
                  className="text-content-text-secondary hover:text-fab-aqua transition-colors text-sm font-body"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms-and-conditions"
                  className="text-content-text-secondary hover:text-fab-aqua transition-colors text-sm font-body"
                >
                  Terms &amp; Conditions
                </a>
              </li>
              <li>
                <a
                  href="/warranty"
                  className="text-content-text-secondary hover:text-fab-aqua transition-colors text-sm font-body"
                >
                  Warranty
                </a>
              </li>
              <li>
                <a
                  href="/media"
                  className="text-content-text-secondary hover:text-fab-aqua transition-colors text-sm font-body"
                >
                  Media
                </a>
              </li>
              <li>
                <a
                  href="/faqs"
                  className="text-content-text-secondary hover:text-fab-aqua transition-colors text-sm font-body"
                >
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 — Contact */}
          <div>
            <h3 className="font-heading text-content-text font-bold uppercase tracking-wider text-sm mb-4">
              Contact Us
            </h3>
            <div className="space-y-2 text-content-text-secondary text-sm font-body">
              <p className="font-medium text-content-text">FAB Defense UK</p>
              <p>A trading name of Shooting Supplies Ltd</p>
              <p>Bromsgrove, Worcestershire</p>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-4 mt-6">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/fabdefenseuk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-content-text-muted hover:text-fab-aqua transition-colors"
                aria-label="Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/fabdefenseuk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-content-text-muted hover:text-fab-aqua transition-colors"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-content-border mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-content-text-muted text-xs font-body">
            &copy; {currentYear} FAB Defense UK. All rights reserved.
          </p>
          <p className="text-content-text-muted text-xs font-body">
            A trading name of Shooting Supplies Ltd
          </p>
        </div>
      </div>
    </footer>
  );
}
