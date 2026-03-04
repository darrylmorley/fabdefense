FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN npm install -g bun && bun install --frozen-lockfile

# Receive build-time DATABASE_URL (needed for Next.js static generation)
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma client and build
COPY . .
RUN bunx prisma generate
RUN NODE_ENV=production bun run build

# --- Runtime stage ---
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Install production dependencies only
COPY package.json bun.lock ./
RUN npm install -g bun && bun install --frozen-lockfile --production

# Copy Next.js build output and generated Prisma client from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["node", "server.js"]
