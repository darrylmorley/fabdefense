"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/fab-defense-logo.webp";
import MobileNav from "@/components/common/MobileNav";
import CartBadge from "@/components/common/CartBadge";
import ProductSearch from "@/components/common/ProductSearch";
import MobileSearch from "@/components/common/MobileSearch";
import { useCart } from "@/context/CartContext";

const menuItems = [
  { name: "Shop", href: "/shop" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Media", href: "/media" },
];

export default function Header() {
  const { openCart } = useCart();

  return (
    <>
      {/* Announcement bar — aqua brand strip */}
      <div className="bg-fab-aqua">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-center gap-4 text-sm">
          <span className="text-white font-semibold uppercase tracking-wider">
            Official UK Retailer
          </span>
        </div>
      </div>

      <div className="sticky top-0 z-50">
        {/* Top tier — Logo + Search + Cart */}
        <header className="bg-white border-b border-content-border shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="shrink-0">
              <Image
                src={logo}
                alt="FAB Defense UK"
                height={80}
                width={160}
                className="h-14 md:h-[70px] w-auto"
                loading="eager"
              />
            </Link>

            {/* Right — Search + Cart + Mobile hamburger */}
            <div className="flex items-center gap-2">
              {/* Search bar (desktop) */}
              <div className="hidden lg:flex items-center">
                <ProductSearch />
              </div>

              {/* Search button (mobile/tablet) */}
              <MobileSearch />

              {/* Cart button — opens drawer */}
              <button
                type="button"
                onClick={openCart}
                className="relative p-2.5 rounded text-content-text-secondary hover:text-fab-aqua transition-all"
                aria-label="Shopping cart"
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
                  <circle cx="8" cy="21" r="1"></circle>
                  <circle cx="19" cy="21" r="1"></circle>
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                </svg>
                <CartBadge />
              </button>

              {/* Mobile hamburger */}
              <MobileNav />
            </div>
          </div>
        </header>

        {/* Bottom tier — Navigation bar */}
        <nav className="hidden md:block bg-white border-b border-content-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center gap-0" aria-label="Main navigation">
              {menuItems.map((item) => (
                <li key={item.href} className="list-none">
                  <a
                    href={item.href}
                    className="block px-6 py-3.5 text-content-text hover:text-fab-aqua font-bold uppercase tracking-[0.15em] transition-colors border-b-2 border-transparent hover:border-fab-aqua"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
}
