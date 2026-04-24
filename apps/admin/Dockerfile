# ═══════════════════════════════════════════
# Stage 1: Dependências
# ═══════════════════════════════════════════
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile

# ═══════════════════════════════════════════
# Stage 2: Build
# ═══════════════════════════════════════════
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter admin build

# ═══════════════════════════════════════════
# Stage 3: Produção
# ═══════════════════════════════════════════
FROM node:22-alpine AS production
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/apps/admin/.next/standalone ./
COPY --from=build /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=build /app/apps/admin/public ./apps/admin/public

USER appuser

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

CMD ["node", "apps/admin/server.js"]
