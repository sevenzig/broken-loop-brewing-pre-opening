# ---------------------------------------------------------------------------
#  Stage 1 -- Build the Vite frontend
# ---------------------------------------------------------------------------
FROM node:22-alpine AS build-frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig*.json vite.config.ts index.html ./
COPY src/ src/
COPY public/ public/

RUN npm run build -- --mode production

# ---------------------------------------------------------------------------
#  Stage 2 -- Build the Express API (TypeScript -> JS)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS build-api

WORKDIR /app/api

COPY api/package.json api/package-lock.json ./
RUN npm ci

COPY api/tsconfig.json ./
COPY api/*.ts ./
COPY api/lib/ lib/
COPY api/db/ db/
COPY api/auth/ auth/

RUN npx tsc

# ---------------------------------------------------------------------------
#  Stage 3 -- Production image
# ---------------------------------------------------------------------------
FROM node:22-alpine AS production

RUN apk add --no-cache wget

WORKDIR /app

# Install only production API dependencies
COPY api/package.json api/package-lock.json ./api/
RUN cd api && npm ci --omit=dev

# Copy compiled API from stage 2
COPY --from=build-api /app/api/dist/ ./api/dist/

# Copy built frontend from stage 1
COPY --from=build-frontend /app/dist/ ./dist/

# Copy schema.sql next to compiled migrate.js (it uses __dirname)
COPY api/db/schema.sql ./api/dist/db/schema.sql

# Copy JSON seed data so db:seed can find it via process.cwd()/public/data
COPY public/data/ ./public/data/

# Copy and prepare entrypoint
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
