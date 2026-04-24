# ═══════════════════════════════════════════
# Stage 1: Dependências
# ═══════════════════════════════════════════
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/types/package.json ./packages/types/
RUN pnpm install --frozen-lockfile

# ═══════════════════════════════════════════
# Stage 2: Build
# ═══════════════════════════════════════════
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
RUN pnpm --filter api build

# ═══════════════════════════════════════════
# Stage 3: Produção
# ═══════════════════════════════════════════
FROM node:22-alpine AS production
WORKDIR /app

# Usuário não-root por segurança
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./

RUN corepack enable pnpm && pnpm install --prod --frozen-lockfile

USER appuser

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3002/health || exit 1

CMD ["node", "dist/server.js"]
