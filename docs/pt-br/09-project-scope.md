# 09 — Escopo do Projeto — Fases e Entregas

**Data:** 2026-04-24

---

## 9.1 Princípios de Escopo

1. **Ship fast, iterate** — Lançar MVP em 6–8 semanas, não em 6 meses
2. **Revenue first** — Cada feature deve ter impacto direto em vendas ou retenção
3. **Cliente como co-designer** — Validar cada tela com a confeiteira antes de construir
4. **Não reinventar a roda** — Usar Stripe, Mux, Resend — não construir do zero

---

## 9.2 Fase 0 — Preparação (Semana 1–2)

**Objetivo:** Setup de ambiente, domínio, contas nos serviços, design system

### Entregáveis

- [ ] Repositório GitHub configurado (Turborepo monorepo)
- [ ] Ambientes configurados: dev, staging, production
- [ ] Contas criadas: Stripe, Mux/Bunny, Neon, Railway, Vercel, Resend
- [ ] Domínio definido e configurado (DNS via Cloudflare)
- [ ] Design system base (cores, tipografia, componentes Shadcn)
- [ ] Schema do banco definido e migrations iniciais
- [ ] CI/CD configurado (GitHub Actions + Vercel + Railway)

---

## 9.3 Fase 1 — MVP (Semana 3–8)

**Objetivo:** Lançar plataforma funcional para a primeira cliente migrar seus cursos do Hotmart.

### Features do MVP

#### Autenticação (Semana 3)

- [ ] Registro de usuário (email + senha)
- [ ] Login com JWT
- [ ] Recuperação de senha via email (Resend)
- [ ] Perfil do usuário
- [ ] Proteção de rotas (middleware Next.js)

#### Gestão de Cursos — Admin do Criador (Semana 3–4)

- [ ] CRUD de curso (título, descrição, thumbnail, preço)
- [ ] CRUD de módulos e aulas
- [ ] Upload de vídeo via Bunny Stream API
- [ ] Player de preview do vídeo
- [ ] Publicação/despublicação de curso
- [ ] Preview da página de vendas

#### Checkout e Pagamentos (Semana 4–5)

- [ ] Stripe Elements integrado
- [ ] Criação de PaymentIntent
- [ ] Webhook de pagamento confirmado
- [ ] Criação automática de enrollment
- [ ] Email de confirmação de compra
- [ ] Política de reembolso (15 dias)

#### Área do Aluno (Semana 5–6)

- [ ] Catálogo de cursos comprados
- [ ] Player de vídeo com progresso
- [ ] Marcação de aula como concluída
- [ ] Barra de progresso por módulo
- [ ] Download de materiais complementares

#### Página de Vendas (Semana 6–7)

- [ ] Landing page do curso (customizável)
- [ ] Integração com checkout
- [ ] Depoimentos (input manual)
- [ ] Seção de FAQ
- [ ] Countdown timer (urgência)

#### Emails Transacionais (Semana 7)

- [ ] Boas-vindas ao criar conta
- [ ] Confirmação de compra
- [ ] Acesso ao curso
- [ ] Lembrete de aula não concluída (7 dias)

#### Certificado (Semana 8)

- [ ] Geração de certificado ao completar 100% do curso
- [ ] Página de verificação pública do certificado
- [ ] Download em PDF

### Critérios de Aceitação do MVP

- [ ] Pelo menos 1 curso publicado e comprável
- [ ] Pagamento real funcional no Stripe (sem modo teste)
- [ ] Vídeo carregando em menos de 3 segundos
- [ ] Mobile responsivo (75%+ do acesso será mobile)
- [ ] Email de confirmação chegando em menos de 2 minutos

---

## 9.4 Fase 2 — Experiência Completa (Semana 9–16)

**Objetivo:** Elevar a qualidade da experiência e preparar para múltiplos criadores.

### Features

#### Comunidade (Semana 9–10)

- [ ] Fórum de discussão por módulo
- [ ] Sistema de perguntas e respostas
- [ ] Notificação de resposta
- [ ] Moderação pelo criador

#### Analytics Avançado (Semana 10–11)

- [ ] Dashboard do criador (vendas, receita, alunos)
- [ ] Taxa de conclusão por módulo
- [ ] Alunos em risco de abandono (alertas)
- [ ] Relatório de renda mensal

#### Migração para Mux Video (Semana 11–12)

- [ ] Upload via Mux API
- [ ] Mux Player substituindo player anterior
- [ ] Legendas automáticas PT-BR (Mux Robots)
- [ ] Analytics de engajamento por vídeo

#### Cupons e Promoções (Semana 12)

- [ ] Criação de cupons de desconto
- [ ] Cupom percentual e valor fixo
- [ ] Data de expiração e limite de usos
- [ ] Cupom de afiliado com tracking

#### Multi-tenancy Básico (Semana 13–15)

- [ ] Registro de novo criador
- [ ] Planos de assinatura (Stripe Billing)
- [ ] Onboarding guiado
- [ ] Subdomínio customizado (`nomecriador.ybr-platform.com`)

#### PWA (Semana 15–16)

- [ ] Service Worker para cache offline
- [ ] Manifest para instalação como app
- [ ] Notificações push (nova aula publicada)

---

## 9.5 Fase 3 — Escala (A partir do Mês 5)

**Objetivo:** Plataforma como produto SaaS para dezenas de criadores.

### Features

- [ ] App mobile nativo (React Native) — Fase 3+
- [ ] Live streaming integrado (criador transmite dentro da plataforma)
- [ ] Sistema de afiliados completo
- [ ] Upsell/cross-sell automático entre cursos
- [ ] Custom domain próprio do criador (CNAME setup)
- [ ] API pública para integrações
- [ ] Integração com email marketing (ActiveCampaign, Mailchimp)
- [ ] Relatórios financeiros avançados (exportação para contabilidade)
- [ ] Suporte a múltiplas moedas (BRL + USD)
- [ ] Marketplace público de cursos (opt-in pelo criador)
- [ ] Programa de certificação e badges

---

## 9.6 O Que Está Fora do Escopo (MVP)

Para manter foco, estas features estão explicitamente **fora** do MVP:

- ❌ App mobile nativo
- ❌ Live streaming
- ❌ Sistema de afiliados
- ❌ Marketplace público
- ❌ Múltiplas moedas
- ❌ DRM de vídeo (adicionado na Fase 2 se necessário)
- ❌ Editor de landing page drag-and-drop
- ❌ Integração com ferramentas de email marketing externas

---

## 9.7 Definição de Done (DoD)

Uma feature está "done" quando:

1. ✅ Funcionalidade implementada conforme especificação
2. ✅ Testes unitários escritos (onde aplicável)
3. ✅ Código passou no Biome (lint + format)
4. ✅ Revisado em PR antes de merge
5. ✅ Testado em mobile (Chrome DevTools + Safari iOS)
6. ✅ Sem erros no Sentry após deploy em staging

---

## 9.8 Glossário do Projeto

| Termo          | Definição                                                           |
| -------------- | ------------------------------------------------------------------- |
| **Criador**    | Usuário com role `creator` — pode criar e vender cursos             |
| **Aluno**      | Usuário com role `student` — pode comprar e assistir cursos         |
| **Enrollment** | Acesso de um aluno a um curso específico após pagamento             |
| **Módulo**     | Agrupamento de aulas dentro de um curso (ex: "Semana 1 — Bases")    |
| **Aula**       | Vídeo individual dentro de um módulo                                |
| **MRR**        | Monthly Recurring Revenue — receita recorrente mensal da plataforma |
| **LTV**        | Lifetime Value — valor total que um aluno gera para o criador       |
| **CAC**        | Customer Acquisition Cost — custo para adquirir 1 novo aluno        |
| **Churn**      | Taxa de cancelamento/reembolso                                      |
| **BNPL**       | Buy Now Pay Later — parcelamento (Klarna, Afterpay)                 |

---

## 9.9 Stack por Serviço

| Serviço         | Repositório         | Deploy     |
| --------------- | ------------------- | ---------- |
| Web (Aluno)     | `apps/web`          | Vercel     |
| Admin (Criador) | `apps/admin`        | Vercel     |
| API             | `apps/api`          | Railway    |
| DB Migrations   | `packages/database` | Local / CI |
