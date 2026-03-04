"use client";

import { useState, useEffect, useCallback } from "react";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  return (
    <>
      {/* Hamburger trigger button — visible on mobile only */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="md:hidden inline-flex items-center justify-center p-2 text-fab-light-gray hover:text-fab-white transition-colors"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      {/* Full-screen overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-fab-black/98 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              type="button"
              onClick={close}
              className="p-2 text-fab-light-gray hover:text-fab-white transition-colors"
              aria-label="Close navigation menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 flex flex-col items-center justify-center gap-10">
            <a
              href="/shop"
              onClick={close}
              className="text-3xl font-semibold uppercase tracking-widest text-fab-off-white hover:text-fab-aqua transition-colors"
            >
              Shop
            </a>
            <a
              href="/about"
              onClick={close}
              className="text-3xl font-semibold uppercase tracking-widest text-fab-off-white hover:text-fab-aqua transition-colors"
            >
              About
            </a>
            <a
              href="/contact"
              onClick={close}
              className="text-3xl font-semibold uppercase tracking-widest text-fab-off-white hover:text-fab-aqua transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
