import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, getRequestIP, RATE_LIMIT_RULES } from "@/lib/rateLimit";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.worldpay.com secure.worldpay.com static.cloudflareinsights.com analytics.shootingsuppliesltd.co.uk",
  "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
  "font-src 'self' fonts.gstatic.com",
  "img-src 'self' data: blob: https: *.digitaloceanspaces.com *.cloudinary.com img.youtube.com",
  "connect-src 'self' *.worldpay.com api.sendinblue.com cloudflareinsights.com analytics.shootingsuppliesltd.co.uk",
  "frame-src 'self' *.worldpay.com secure.worldpay.com https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' *.worldpay.com",
].join("; ");

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting
  const rule = RATE_LIMIT_RULES[pathname];
  if (rule) {
    const ip = getRequestIP(request);
    const { allowed, retryAfter } = checkRateLimit(`${pathname}:${ip}`, rule);
    if (!allowed) {
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      });
    }
  }

  // CSRF origin check for mutating methods (production only)
  const siteUrl = process.env.PUBLIC_SITE_URL;
  if (process.env.NODE_ENV === "production" && siteUrl && request.method !== "GET" && request.method !== "HEAD") {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(siteUrl).origin) {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Build response with security headers
  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", CSP);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
