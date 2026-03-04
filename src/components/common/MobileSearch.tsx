"use client";

import React, { useState, useEffect } from "react";

export default function MobileSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(query.trim())}`;
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
  };

  useEffect(() => {
    const handleToggle = (e: CustomEvent) => {
      setIsOpen(true);
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener(
      "toggle-mobile-search",
      handleToggle as EventListener,
    );
    document.addEventListener("keydown", handleEscape);

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener(
        "toggle-mobile-search",
        handleToggle as EventListener,
      );
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={handleClose}>
      <div
        className="absolute top-0 left-0 right-0 bg-white border-b border-content-border shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-content-text-muted"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH PRODUCTS"
                autoFocus
                className="w-full bg-content-elevated text-content-text text-sm font-medium uppercase tracking-wider pl-10 pr-12 py-3 border border-content-border rounded focus:outline-none focus:border-fab-aqua placeholder:text-content-text-muted transition-colors"
              />
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-content-text-secondary hover:text-content-text transition-colors"
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
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
