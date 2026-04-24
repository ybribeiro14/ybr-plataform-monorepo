# 07 — Análise Completa de Custos do Projeto

**Data:** 2026-04-24

---

## 7.1 Custos de Desenvolvimento (One-Time)

### Estimativa de Horas por Módulo

| Módulo               | Descrição                                  | Horas Estimadas   |
| -------------------- | ------------------------------------------ | ----------------- |
| Autenticação         | Login, registro, recuperação de senha, JWT | 20–30h            |
| Gestão de cursos     | CRUD de cursos, módulos, aulas             | 40–60h            |
| Upload de vídeo      | Integração Mux/Bunny, progresso de upload  | 20–30h            |
| Player de vídeo      | Mux Player, progresso, legendas            | 15–20h            |
| Checkout             | Stripe, parcelamento, webhooks             | 30–40h            |
| Área do aluno        | Catálogo, progresso, certificados          | 30–40h            |
| Admin do criador     | Dashboard, analytics, configurações        | 40–50h            |
| Emails transacionais | Confirmações, boas-vindas, recuperação     | 10–15h            |
| Certificados         | Geração de PDF de certificado              | 10–15h            |
| Infraestrutura       | Setup inicial, CI/CD, ambiente             | 20–25h            |
| Testes               | Unitários + integração                     | 20–30h            |
| **TOTAL**            |                                            | **255–355 horas** |

### Fase 1 (MVP — Lançamento da Primeira Cliente)

**Escopo reduzido para MVP:**

- Autenticação básica
- Upload de vídeo + player
- Checkout Stripe
- Área do aluno (lista de aulas + player + progresso)
- Emails básicos (confirmação de compra, acesso)

**Estimativa MVP:** ~120–160 horas

---

## 7.2 Custos Recorrentes por Fase

### Fase 1: Bootstrap / MVP

**Período:** Mês 1–3  
**Cenário:** 1 cliente, 0–100 alunos ativos

| Categoria               | Serviço              | Custo Mensal   |
| ----------------------- | -------------------- | -------------- |
| **Hosting**             |                      |                |
| Frontend                | Vercel Pro           | $20            |
| Backend API             | Railway Pro          | $20            |
| **Database**            |                      |                |
| PostgreSQL              | Neon Launch          | $19            |
| Cache                   | Upstash Free         | $0             |
| **Storage**             |                      |                |
| Arquivos (PDFs etc.)    | Cloudflare R2        | $1–3           |
| **Vídeo**               |                      |                |
| Streaming               | Bunny Stream         | $3–10          |
| **Comunicação**         |                      |                |
| Email                   | Resend Free          | $0             |
| DNS / CDN               | Cloudflare Free      | $0             |
| **Ferramentas de Dev**  |                      |                |
| Sentry (error tracking) | Developer Free       | $0             |
| Domínio (.com)          | Namecheap/Cloudflare | ~$1            |
| **TOTAL**               |                      | **$64–73/mês** |

---

### Fase 2: Crescimento

**Período:** Mês 4–12  
**Cenário:** 1–3 clientes, 100–500 alunos ativos

| Categoria         | Serviço                | Custo Mensal     |
| ----------------- | ---------------------- | ---------------- |
| Frontend          | Vercel Pro + uso       | $30–60           |
| Backend API       | Railway Pro + uso      | $30–60           |
| PostgreSQL        | Neon Scale             | $69              |
| Cache             | Upstash Pro            | $10              |
| Storage R2        | Cloudflare Pay-as-go   | $5–15            |
| Vídeo             | Mux (upgrade do Bunny) | $50–150          |
| Email             | Resend Pro             | $20              |
| Sentry            | Team                   | $26              |
| PostHog Analytics | Free (1M events)       | $0               |
| **TOTAL**         |                        | **$240–410/mês** |

**Receita esperada:** $200–600/mês (2–6 clientes × $99/mês)  
**Margem:** Negativa a neutra — fase de crescimento

---

### Fase 3: Escala

**Período:** Ano 2+  
**Cenário:** 10–30 clientes, 500–5.000 alunos ativos

| Categoria      | Serviço                      | Custo Mensal         |
| -------------- | ---------------------------- | -------------------- |
| Frontend       | Vercel Pro (volume)          | $100–200             |
| Backend API    | Railway Pro (multi-instance) | $100–200             |
| PostgreSQL     | Neon Scale + HA              | $200–400             |
| Cache          | Upstash Business             | $50–100              |
| Storage        | Cloudflare R2 (volume)       | $20–50               |
| Vídeo          | Mux (volume)                 | $300–1.000           |
| Email          | Resend Business              | $89                  |
| Sentry         | Business                     | $89                  |
| PostHog        | Scale                        | $0–500               |
| Algolia Search | Grow                         | $50                  |
| **TOTAL**      |                              | **$1.000–2.600/mês** |

**Receita esperada:** $3.000–15.000/mês  
**Margem:** 60–80%+ com volume

---

## 7.3 Custo por Aluno Ativo

| Fase        | Alunos | Custo Infra | Custo por Aluno |
| ----------- | ------ | ----------- | --------------- |
| Bootstrap   | 50     | $70/mês     | $1.40/aluno     |
| Crescimento | 300    | $300/mês    | $1.00/aluno     |
| Escala      | 2.000  | $1.500/mês  | $0.75/aluno     |

**Benchmark Hotmart:** O custo do Hotmart por venda de $197 é de $19.50 (9.9%).  
Nossa plataforma: ~$1/aluno de custo de infra + $0 de comissão = **95% de economia na taxa**.

---

## 7.4 Análise de Break-Even para a Cliente

**Hipótese:** Cliente com $10.000/mês de receita bruta

| Situação      | Custo Plataforma | Custo Hotmart      | Diferença Mensal |
| ------------- | ---------------- | ------------------ | ---------------- |
| Hotmart atual | $0               | $990 (9.9%)        | —                |
| YBR Starter   | $49/mês          | $290 (2.9% Stripe) | **+$651/mês**    |
| YBR Growth    | $99/mês          | $290 (2.9% Stripe) | **+$601/mês**    |

**Break-even:** A cliente já economiza a partir da primeira venda de $500+ no mês.  
**Economia anual (YBR Growth vs Hotmart):** ~$7.200/ano para $10K/mês de vendas.

---

## 7.5 Custos de Escalabilidade de Vídeo

**Cenário prático: 1 curso com 20 aulas de 15 min cada**

| Vídeos           | Minutos Totais | 100 alunos/mês       | Custo Bunny | Custo Mux |
| ---------------- | -------------- | -------------------- | ----------- | --------- |
| 20 aulas × 15min | 300 min        | 30.000 min delivery  | $3/mês      | $24/mês   |
| 40 aulas × 15min | 600 min        | 60.000 min delivery  | $6/mês      | $48/mês   |
| 80 aulas × 20min | 1.600 min      | 160.000 min delivery | $16/mês     | $128/mês  |

_Cálculos: Bunny $0.005/GB × ~200MB/h = ~$0.0002/min; Mux $0.0008/min_

---

## 7.6 Investimento Inicial Total

### Mínimo Viável para Lançar

| Item                                       | Custo               |
| ------------------------------------------ | ------------------- |
| Desenvolvimento MVP (~150h × taxa horária) | Interno (sem custo) |
| Infraestrutura Fase 1 (3 meses)            | $200–220            |
| Domínio (1 ano)                            | $12–15              |
| Ferramentas de dev (Figma, etc.)           | $0–50               |
| **TOTAL**                                  | **$212–285**        |

**Nota:** Se todo o desenvolvimento for interno, o investimento inicial é mínimo.

### Recomendado para Launch Profissional

| Item                                      | Custo              |
| ----------------------------------------- | ------------------ |
| Desenvolvimento MVP + UI (100–150h)       | Interno            |
| Design UI/UX (se contratado externamente) | $500–2.000         |
| Infraestrutura Fase 1 (3 meses)           | $200               |
| Testes com usuários reais                 | $0 (usuários beta) |
| Marketing de lançamento                   | $200–500           |
| **TOTAL**                                 | **$900–2.700**     |

---

## 7.7 Projeção de Receita SaaS (DIV Brands)

**Modelo:** Assinatura mensal por criador

| Mês | Clientes | MRR    | Custo Infra | Margem Bruta |
| --- | -------- | ------ | ----------- | ------------ |
| 1   | 1        | $49    | $70         | -$21         |
| 3   | 1        | $49    | $70         | -$21         |
| 6   | 3        | $297   | $200        | $97          |
| 9   | 6        | $594   | $280        | $314         |
| 12  | 10       | $990   | $380        | $610         |
| 18  | 20       | $1.980 | $800        | $1.180       |
| 24  | 35       | $3.465 | $1.500      | $1.965       |

---

## 7.8 Riscos Financeiros

| Risco                    | Probabilidade | Impacto | Mitigação                                   |
| ------------------------ | ------------- | ------- | ------------------------------------------- |
| Mux aumenta preços       | Baixa         | Médio   | Migração para Bunny                         |
| Vercel aumenta preços    | Baixa         | Baixo   | Self-host via Railway                       |
| Baixa adoção de clientes | Média         | Alto    | Focar em resultados da 1ª cliente como case |
| Chargeback excessivo     | Baixa         | Médio   | Stripe Radar + política clara de reembolso  |
| Downtime de vídeo        | Baixa         | Alto    | Monitoramento + SLA contratual              |
