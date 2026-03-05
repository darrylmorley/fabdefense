# FAB Defense UK — Project Context

## Overview
Official UK retailer for FAB Defense tactical accessories. eCommerce storefront backed by Lightspeed POS for product data and inventory, Worldpay for card payments, and Brevo for transactional email.

**URL**: https://www.fabdefense.co.uk
**Operator**: Shooting Supplies Ltd (shootingsuppliesltd.co.uk)

## Stack
- **Framework**: Next.js 15 (App Router), React 19
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL via Prisma ORM
- **Package manager**: Bun (`bun.lock` present — use `bun` not npm/node)
- **Logging**: Pino with pino-pretty in dev
- **Error tracking**: Sentry (`@sentry/nextjs`)

## Key Integrations
- **Lightspeed POS** — used only for order operations (create/complete/cancel sales); product/category data comes from the PostgreSQL database, NOT from Lightspeed directly; `src/lib/lightspeed/index.ts`
- **Worldpay** — hosted payment pages; webhook IP allowlist enforced; `src/app/api/payment/worldpay/`
- **Brevo** — transactional email; `src/lib/email/`
- **Plausible Analytics** — self-hosted at `analytics.shootingsuppliesltd.co.uk`

## Environment Variables
```
APP_ENV=production          # Controls prod vs test for Worldpay (NOT NODE_ENV)
PUBLIC_SITE_URL             # Server-side site URL
NEXT_PUBLIC_SITE_URL        # Client-side site URL (if needed)
DATABASE_URL                # PostgreSQL connection string
LIGHTSPEED_ID               # Lightspeed OAuth client ID
LIGHTSPEED_SECRET           # Lightspeed OAuth client secret
LIGHTSPEED_REFRESH_TOKEN    # Lightspeed OAuth refresh token
ACCOUNT_ID                  # Lightspeed account ID
LIGHTSPEED_EMPLOYEE_ID      # Default: 9
LIGHTSPEED_REGISTER_ID      # Default: 2
WORLDPAY_ENTITY / WORLDPAY_ENTITY_TEST
WORLDPAY_API_KEY / WORLDPAY_API_KEY_TEST
WORLDPAY_USER / WORLDPAY_USER_TEST
WORLDPAY_PASSWORD / WORLDPAY_PASSWORD_TEST
ADMIN_EMAIL                 # Default: info@fabdefense.co.uk
```

## Critical Constants (`src/config/config.ts`, `src/lib/constants.ts`)
```ts
FAB_DEFENSE_MANUFACTURER_ID = 55   // All product queries filter by this
SITE_SLUG = "FABDEFENSE"           // Used for category_overrides lookup
HIDDEN_CATEGORY_IDS                // Excluded from all product listings
RESTRICTED_CATEGORIES              // Age/licence restricted product categories
MAGAZINE_CATEGORY_IDS              // Magazine products (special handling)
DELIVERY_LIGHTSPEED_IDS = [7476, 8403, 8461]  // Delivery "products" in cart
```

## Project Structure
```
src/
  app/                      # Next.js App Router pages + API routes
    api/
      cart/                 # Cart CRUD (session-token based)
      payment/worldpay/     # create / process / callback (webhook)
      delivery/estimate/    # Delivery cost estimate
      addresses/search/     # Address lookup (Royal Mail / postcode API)
      products/             # list + search
      categories/list/
      cache/invalidate/     # Admin: invalidate delivery cache
      contact/
    product/[slug]/
    category/[category]/
    shop/
    checkout/
    result/                 # Payment result page (accept / declined / cancelled)
  components/
    layout/                 # Header, Footer
    cart/                   # CartDrawer, AddToCartButton
    checkout/               # CheckoutPage, AddressForm, PaymentOptions, OrderSummary
    product/                # ProductCard, ProductGrid, ProductImageGallery, ShopFilters
    home/                   # Hero, FeaturedProducts, BrandStory
    common/                 # CartBadge, MobileNav, MobileSearch, ProductSearch
    ui/                     # Breadcrumbs, PageHeader
    contact/                # ContactForm
    media/                  # VideoGallery
  context/
    CartContext.tsx          # Cart state (React Context) — single source of truth
  lib/
    api/                    # products.ts, categories.ts, cart.ts — Prisma queries
    lightspeed/index.ts     # Lightspeed POS API client
    cache/                  # deliveryCache (in-memory), build-time cache, file/redis stubs
    email/                  # mail.ts (Brevo), saleNotification.ts, criticalFailure.ts
    logging/logger.ts       # Pino logger + logError/logInfo/logWarn/logDebug helpers
    delivery.ts             # Delivery calculation logic
    orders/                 # completeOrder, cancelOrder, markOrderRefused
    prisma.ts               # Prisma client singleton
    constants.ts            # HIDDEN_CATEGORY_IDS, RESTRICTED_CATEGORIES, etc.
    rateLimit.ts            # Rate limiting middleware
    seo/metadata.ts         # SEO metadata helpers
    analytics.ts            # Analytics event helpers
    clientError.ts          # Client-side error capture
  schemas/                  # JSON-LD structured data schemas
  types/
    index.ts                # Core interfaces: ProductForCard, ProductDetail, Cart, CartItem, etc.
    worldpay.ts             # Worldpay event/webhook types
    images.d.ts             # Static image import declarations (.webp/.png/.jpg)
  config/config.ts          # Site config, Worldpay URLs, email recipients
  assets/images/            # Static brand images (logo, category hero images)
```

## Cart Architecture
- Session token stored in `localStorage` (`cart_session_token`)
- Cart data cached in `localStorage` for 5 minutes (`cart_cache`)
- Session token sent as `x-session-token` header on all cart API requests
- Delivery "products" are real Lightspeed items — filtered out of displayed item count using `DELIVERY_LIGHTSPEED_IDS`
- `CartProvider` wraps the whole app; use `useCart()` hook in client components

## Payment Flow (Worldpay)
1. `POST /api/payment/worldpay/create` — creates Lightspeed sale, returns Worldpay payment URL
2. User completes payment on Worldpay hosted page
3. Worldpay POSTs to `POST /api/payment/worldpay/callback` (webhook) — IP-allowlisted
4. Webhook calls `completeOrder` / `cancelOrder` / `markOrderRefused` in `src/lib/orders/`
5. Worldpay also redirects user to `/result?accept=true|declined|cancelled|exception`
6. Result page also attempts `completeOrder` server-side as fallback
- **Transaction reference** = Lightspeed sale ID (used to correlate webhook to order)
- `APP_ENV === "production"` selects live vs test Worldpay credentials/URLs

## Prisma Notes
- Run `bunx prisma generate` before first build to avoid implicit `any` TS errors
- Schema uses snake_case DB columns mapped to camelCase TypeScript fields
- Key models: `products`, `categories`, `carts`, `cart_items`, `orders`, `manufacturers`, `category_overrides`
- Products always filtered by `manufacturerID: 55` (FAB Defense) and `archived: false`

## Design System
- **Brand color**: Aqua `#49C5D2` — no gradients
- **Background**: White/light dominant; gunmetal `#1A1C1E` for contrast sections
- **Fonts**: Barlow (body), Barlow Condensed (headings), JetBrains Mono (prices/SKUs/labels)
- **Tailwind**: v4 with custom CSS variables in `globals.css`
- **Icons**: lucide-react
- **Carousel/Slider**: Swiper

## Logging Conventions
```ts
// Use structured helpers from src/lib/logging/logger.ts:
logError("message", error, { extra: "context" });
logInfo("message", { key: "value" });
logWarn("message");
logDebug("message");

// Or direct pino logger for object-first style:
logger.error({ status, response }, "Lightspeed API call failed:");
```

## API Route Conventions
- Cart routes require `x-session-token` header (no auth cookies)
- Worldpay callback verifies source IP against allowlist; responds 200 even on error to prevent retries
- All product endpoints filter to `manufacturerID: 55`
- Rate limiting applied to sensitive routes via `src/lib/rateLimit.ts`

## Common Gotchas
- `APP_ENV` (not `NODE_ENV`) controls production Worldpay credentials
- `HIDDEN_CATEGORY_IDS` must be maintained when adding new categories to exclude
- Lightspeed token is refreshed on every API call (no token caching currently)
- Delivery items appear as cart items in Lightspeed but are hidden from the UI using `DELIVERY_LIGHTSPEED_IDS`
- `formatProductName()` (`src/lib/utils/product-format.ts`) is applied to all product names before returning — do not skip this
- Static image imports need `src/types/images.d.ts` declaration to compile

## Development
```bash
bun dev           # Start dev server
bun build         # Production build (user runs this themselves — don't run it)
bunx prisma generate   # Regenerate Prisma client after schema changes
bunx prisma studio     # GUI for the database
```
