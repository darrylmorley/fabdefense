# FAB Defense — Project Context

## Overview
Live eCommerce site for FAB Defense, a tactical accessories brand. Built with Next.js App Router, integrated with Lightspeed Retail for product/inventory data and Worldpay for payment processing.

**URL:** fabdefense.com  
**Status:** Live and actively maintained

---

## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database/ORM:** Prisma
- **Product Data:** Lightspeed Retail SDK
- **Payments:** Worldpay
- **Runtime:** Bun
- **Deployment:** Docker + CapRover (DigitalOcean)
- **DNS:** Cloudflare

---

## Project Structure
```
src/
  app/                    # Next.js App Router pages
    api/                  # API routes
      cart/               # Cart management (items, delivery, customer)
      payment/worldpay/   # Worldpay (create, process, callback)
      lightspeed/sale/    # Lightspeed sale creation
      products/           # Product list and search
      categories/         # Category data
      addresses/          # Address lookup/search
      delivery/           # Delivery estimation
      cache/invalidate/   # Manual cache invalidation
    category/[category]/  # Category pages
    product/[slug]/       # Product detail pages
    checkout/             # Checkout flow
    shop/                 # Shop listing
    contact/              # Contact page
    result/               # Order result/confirmation
  types/                  # Shared TypeScript types
  context/                # React context providers
prisma/                   # Prisma schema and migrations
public/                   # Static assets
```

---

## Key Integrations

### Lightspeed Retail
- Primary source of product and inventory data
- Products are fetched via the Lightspeed Retail SDK
- Caching is in place — use `/api/cache/invalidate` to bust cache when product data seems stale
- Check existing API route patterns in `src/app/api/products/` before adding new Lightspeed calls

### Worldpay Payments
- Three-stage payment flow: create → process → callback
- Callback endpoint must be reachable externally — ensure it is not blocked by middleware or Cloudflare rules
- Payment routes live in `src/app/api/payment/worldpay/`
- Do not change the callback URL structure without updating Worldpay merchant settings

### Prisma
- Used for any persistent data not handled by Lightspeed
- Always run migrations carefully on live — check `prisma/` for schema before making changes
- Use `bun run prisma:generate` after schema changes

---

## Middleware
- Middleware is active — be aware it may affect API routes and redirects
- Check `src/middleware.ts` before adding new routes or redirect logic

---

## Deployment
- Runs in Docker on CapRover
- Environment variables are set in CapRover dashboard — not in `.env` files on the server
- Cloudflare proxies the domain — cache rules and firewall settings may affect API behaviour
- Worldpay callback URLs must be reachable — whitelist in both Worldpay merchant portal and ensure Cloudflare is not blocking POST requests to `/api/payment/worldpay/callback`

---

## Development Notes
- Use Bun for all installs and script running
- `bun run dev` to start local development
- TypeScript strict mode is on — fix type errors, don't use `any` as a shortcut
- Match existing patterns in API routes before introducing new approaches
- Do not refactor working code unless explicitly asked
- When fixing bugs, explain the root cause not just the fix
- Make incremental changes — this is a live site

---

## Things to Be Careful With
- **Worldpay callback** — fragile integration, do not change route structure or response format without thorough testing
- **Cache invalidation** — Lightspeed data is cached; stale data issues should check `/api/cache/invalidate` first
- **Middleware** — can silently affect routes; always check it when debugging unexpected redirect or auth behaviour
- **Prisma migrations** — always review before running against live database
- **Environment variables** — managed in CapRover, not locally committed; never hardcode keys