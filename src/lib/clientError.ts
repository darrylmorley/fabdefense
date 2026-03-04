"use client";

import * as Sentry from "@sentry/nextjs";

export function captureClientError(message: string, error?: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(message, error);
    return;
  }
  if (error instanceof Error) {
    Sentry.captureException(error, { extra: { message } });
  } else {
    Sentry.captureMessage(message, { level: "error", extra: { detail: String(error ?? "") } });
  }
}
