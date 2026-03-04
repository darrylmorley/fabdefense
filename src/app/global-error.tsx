"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-content-bg">
          <div className="text-center px-4">
            <h1 className="font-heading text-4xl font-black uppercase text-content-text mb-4">
              Something went wrong
            </h1>
            <p className="text-content-text-secondary mb-8">
              We&apos;ve been notified and are looking into it.
            </p>
            <button
              onClick={reset}
              className="bg-fab-aqua hover:bg-fab-aqua-hover text-white font-bold uppercase tracking-wider px-8 py-3 text-sm transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
