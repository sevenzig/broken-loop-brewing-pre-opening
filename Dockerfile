# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
#  Stage 1 -- Build the Vite frontend  (parallel with stage 2 under BuildKit)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS build-frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY tsconfig*.json vite.config.ts index.html ./
COPY api/tsconfig.json api/tsconfig.json
COPY src/ src/
COPY public/ public/

RUN npm run build

# ---------------------------------------------------------------------------
#  Stage 2 -- Build the Express API, then prune to prod-only deps
# ---------------------------------------------------------------------------
FROM node:22-alpine AS build-api

WORKDIR /app/api

COPY api/package.json api/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY api/ .

RUN npx tsc && npm prune --omit=dev

# ---------------------------------------------------------------------------
#  Stage 3 -- Production image (no npm install needed)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS production

RUN apk add --no-cache wget

WORKDIR /app

# Carry over pre-pruned node_modules from the API build stage
COPY --from=build-api /app/api/package.json ./api/
COPY --from=build-api /app/api/node_modules/ ./api/node_modules/
COPY --from=build-api /app/api/dist/ ./api/dist/

# Copy built frontend from stage 1
COPY --from=build-frontend /app/dist/ ./dist/

# Copy schema + seed data for migration/seed at boot
COPY api/db/schema.sql ./api/dist/db/schema.sql
COPY public/data/ ./public/data/

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3000
ENV SERVE_STATIC=true
ENV STATIC_DIR=/app/dist
ENV RUN_MIGRATIONS=true

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
