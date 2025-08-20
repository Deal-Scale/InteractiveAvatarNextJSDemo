# Multi-stage Dockerfile for Next.js (pnpm) suitable for Coolify
# Node 20 LTS Alpine

# 1) Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
ENV CI=1
# Enable Corepack to use pnpm
RUN corepack enable

# Only copy lockfile and package.json first for better caching
COPY package.json pnpm-lock.yaml* ./
# Use a cached pnpm store to speed up builds
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 2) Build the app
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable

# Bring in node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the source code
COPY . .

# Build Next.js
RUN pnpm build

# 3) Production runner with only prod deps
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Install only production dependencies
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable \
  && --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Copy build outputs
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
# If you have custom configs that Next needs at runtime, copy them here as well
# COPY --from=builder /app/tailwind.config.js ./tailwind.config.js
# COPY --from=builder /app/postcss.config.js ./postcss.config.js

EXPOSE 3000
USER nextjs
CMD ["pnpm", "start", "--", "-p", "3000"]
