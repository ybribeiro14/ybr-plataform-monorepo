# YBR Platform

Plataforma white-label de cursos online para criadores brasileiros nos EUA.

## Requisitos

- Node.js >= 22
- pnpm >= 9
- Docker + Docker Compose (para banco local)

## Setup

```bash
# 1. Instalar dependências
pnpm install

# 2. Copiar variáveis de ambiente
cp .env.example .env.local
# Preencha as variáveis conforme .env.example

# 3. Subir banco de dados local
docker compose up -d

# 4. Rodar migrations
pnpm db:migrate

# 5. Iniciar todos os apps em modo dev
pnpm dev
```

## Estrutura

```
platform/
├── apps/
│   ├── web/      # Next.js 15 — Área do aluno + Checkout + Landing Page
│   ├── admin/    # Next.js 15 — Painel do criador
│   └── api/      # Fastify 5 — Backend REST API
└── packages/
    ├── ui/         # Componentes Shadcn compartilhados
    ├── schemas/    # Schemas Zod compartilhados
    ├── database/   # Drizzle schema + migrations
    ├── hls-player/ # Player HLS customizado
    └── types/      # TypeScript types compartilhados
```

## Apps

| App     | URL Local             | Descrição         |
| ------- | --------------------- | ----------------- |
| `web`   | http://localhost:3000 | Área do aluno     |
| `admin` | http://localhost:3001 | Painel do criador |
| `api`   | http://localhost:3002 | REST API          |

## Comandos úteis

```bash
pnpm dev              # Sobe todos os apps
pnpm build            # Build de produção
pnpm lint             # Lint com Biome
pnpm test             # Roda todos os testes
pnpm db:migrate       # Aplica migrations pendentes
pnpm db:studio        # Abre Drizzle Studio (UI do banco)
docker compose up -d  # Sobe PostgreSQL + Redis localmente
docker compose down   # Para os containers
```

## Documentação

Ver `ybr-plataform/plataform/docs/` para documentação completa do projeto.
