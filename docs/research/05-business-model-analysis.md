# 05 — Análise de Modelo de Negócio — YBR Platform

**Data:** 2026-04-29 | **Atualizado:** 2026-04-29  
**Status:** 📋 Rascunho para decisão  
**Moeda de cobrança:** USD (dólar americano) — mercado-alvo do primeiro cliente e padrão universal  
**Objetivo:** Definir como a YBR Platform cobrará dos criadores (nossos clientes B2B).

---

## Contexto e Premissas

### O que entregamos ao criador

- Plataforma de cursos **100% white-label** (sem menção à YBR Platform para os alunos)
- Hospedagem de vídeos (Bunny Stream)
- Área de membros para alunos com player, progresso, certificados
- Workstation para criação e publicação de cursos
- Sistema de matrículas (via webhook do sistema de pagamento externo + link de convite manual)
- Mensageria transacional (Resend): boas-vindas, onboarding, lembretes
- Subdomínio gerenciado por nós: `cliente.ybr-platform.com`

### O que NÃO entregamos (responsabilidade do criador)

- Processamento de pagamento dos alunos (sistema externo separado)
- Página de vendas / landing page (sistema externo separado)
- Suporte direto aos alunos

### Perfil do primeiro cliente — Criadora de Confeitaria (EUA)

- **Mercado:** Brasileira vendendo cursos de confeitaria para o mercado americano, em inglês, recebendo em dólar
- **Plataforma atual:** Hotmart — considerou caro devido às taxas sobre cada venda
- **Plataformas testadas:** Hotmart (ativa), Kiwify (testou)
- **Curso atual:** 1 curso principal de confeitaria de bolos a **$137/aluno**
- **Planos de expansão:** Cursos menores e mais específicos (ex: "Como fazer bem-casado"), cada um com meta de ~100 alunos
- **Meta por lançamento:** ~100 alunos por curso
- **Receita por lançamento (curso principal):** 100 × $137 = **$13.700**

---

## Análise de Concorrentes

> **Foco:** Hotmart e Kiwify — as plataformas que a primeira cliente já usou ou testou. As demais servem como referência de mercado.

### Hotmart — Plataforma atual da cliente

| Critério                      | Detalhe                                        |
| ----------------------------- | ---------------------------------------------- |
| **Modelo**                    | % por venda (sem mensalidade)                  |
| **Taxa internacional**        | ~9.9% do valor + taxas de câmbio/gateway       |
| **Venda de $137**             | ~$13,56 por aluno vai para a Hotmart           |
| **100 alunos × $137**         | ~**$1.356 em taxas** por lançamento            |
| **Suporte internacional USD** | ✅ Boa infraestrutura para vendas em dólar     |
| **White-label**               | ❌ Logo e URL da Hotmart visíveis para o aluno |
| **Área de membros**           | ✅ Incluída                                    |
| **Hospedagem de vídeo**       | ✅ Incluída                                    |
| **Ponto de dor reportado**    | Taxa de 9.9% considerada alta pela cliente     |

### Kiwify — Plataforma que a cliente testou

| Critério             | Detalhe                                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Modelo**           | % por venda (sem mensalidade)                                                                                           |
| **Taxa**             | 8.99% + R$2,49/transação                                                                                                |
| **Foco**             | Mercado brasileiro (BRL) — suporte a USD limitado                                                                       |
| **White-label**      | ❌ Parcial                                                                                                              |
| **Área de membros**  | ✅ Incluída                                                                                                             |
| **Ponto de atenção** | Plataforma voltada ao mercado doméstico brasileiro; vendas em USD têm conversão para BRL com taxas adicionais de câmbio |

### Outras plataformas (referência de mercado)

| Plataforma    | Modelo            | Preço (USD)                              | Obs                                |
| ------------- | ----------------- | ---------------------------------------- | ---------------------------------- |
| **Teachable** | Mensalidade + %   | $29/mês + 7.5% (Starter) → $69/mês sem % | Mercado americano                  |
| **Thinkific** | Mensalidade       | $36–$149/mês                             | Sem % nas vendas                   |
| **Kajabi**    | Mensalidade alta  | $69–$399/mês                             | All-in-one, inclui email marketing |
| **MemberKit** | Mensalidade (BRL) | ~$40–$140/mês equiv.                     | Não hospeda vídeo, foco BRL        |

### Insight chave

> Para uma criadora vendendo **em dólar para o mercado americano**, Hotmart é de fato a opção mais consolidada — mas cobra quase **10% de cada venda**. Em um lançamento de 100 alunos a $137, são **$1.356 que ficam com a Hotmart**.
>
> Nossa proposta troca essa % por uma **mensalidade fixa em dólar**, independente do volume de vendas. Quanto mais ela vende, maior é a economia.

---

## Modelos de Cobrança Analisados

> Todos os valores em **USD**. Cobrança em dólar é o padrão dado o perfil do primeiro cliente e facilita a expansão para outros criadores internacionais.

### Modelo A — Mensalidade por Número de Alunos Ativos ⭐ Recomendado

Simples de explicar: "você paga conforme sua base cresce."

| Plano          | Alunos ativos | Preço/mês    | Cursos     | Storage / Delivery |
| -------------- | ------------- | ------------ | ---------- | ------------------ |
| **Starter**    | até 500       | **$39/mês**  | Ilimitados | 50GB / 500GB       |
| **Growth**     | até 2.000     | **$79/mês**  | Ilimitados | 200GB / 2TB        |
| **Pro**        | até 10.000    | **$139/mês** | Ilimitados | 1TB / 10TB         |
| **Enterprise** | +10.000       | A negociar   | Ilimitados | Ilimitado          |

> "Aluno ativo" = matrícula ativa em pelo menos 1 curso.

**Prós:**

- Modelo comprovado no mercado (Teachable, Thinkific usam variações disso)
- Escala com o crescimento do criador — alinhamento de incentivos
- Fácil de comunicar: "pague conforme sua base cresce"
- Para a primeira cliente: $39/mês cobre confortavelmente o cenário inicial (100 alunos)

**Contras:**

- Não reflete uso real de vídeo (criador com vídeos 4K custa mais para nós)
- Pode gerar margem apertada se o criador tiver poucos alunos mas muito conteúdo pesado

---

### Modelo B — Mensalidade Flat (Tudo Incluso)

Um preço único, sem limites.

| Plano          | Preço/mês  | Limite                             |
| -------------- | ---------- | ---------------------------------- |
| **Studio**     | $99/mês    | Tudo ilimitado                     |
| **Enterprise** | A negociar | Domínio próprio + suporte dedicado |

**Prós:** Máxima simplicidade, zero fricção de upgrade  
**Contras:** Pode ser caro para quem está começando ($99 vs $39 do Starter no Modelo A)

---

### Modelo C — Mensalidade por Recursos (Storage + Bandwidth)

| Plano       | Storage | Bandwidth/mês | Preço/mês |
| ----------- | ------- | ------------- | --------- |
| **Starter** | 10GB    | 100GB         | $29       |
| **Growth**  | 50GB    | 500GB         | $59       |
| **Pro**     | 200GB   | 2TB           | $119      |

**Prós:** Justo tecnicamente  
**Contras:** "GB de bandwidth" não faz sentido para uma confeiteira — péssima experiência de produto

---

### Modelo D — Mensalidade + % nas Vendas

**Inviável no MVP** — o processamento de pagamento dos alunos é feito por sistema externo e não temos visibilidade das transações. Possível em Fase 3 se unificarmos os projetos.

---

### Modelo E — Freemium

| Plano       | Alunos  | Preço/mês |
| ----------- | ------- | --------- |
| **Free**    | até 30  | $0        |
| **Starter** | até 500 | $39       |

**Não recomendado para o lançamento** — gera custo real (hospedagem de vídeos) sem receita.

---

---

## Projeção de Custos de Infraestrutura

### Para 1 criador ativo (MVP — primeiro cliente)

| Cenário    | Alunos  | Storage vídeo | Delivery/mês | Custo infra (USD) |
| ---------- | ------- | ------------- | ------------ | ----------------- |
| Lançamento | 50–200  | ~5–15GB       | ~30–50GB     | **~$8–13/mês**    |
| 6 meses    | 200–500 | ~15–40GB      | ~100–200GB   | **~$16–30/mês**   |

### Para 5 criadores ativos (Fase 2)

| Cenário     | Total alunos | Custo infra estimado |
| ----------- | ------------ | -------------------- |
| Conservador | 500–1.500    | **~$50–100/mês**     |
| Otimista    | 1.500–5.000  | **~$100–300/mês**    |

---

## Comparativo Real — Primeira Cliente (Hotmart vs Kiwify vs YBR)

### Cenário A — Curso principal ($137/aluno, meta de 100 alunos)

| Plataforma                | Taxa                  | Custo por lançamento (100 alunos) | Custo anual (4 lançamentos) |
| ------------------------- | --------------------- | --------------------------------- | --------------------------- |
| **Hotmart**               | 9.9%                  | **$1.357**                        | **$5.428**                  |
| **Kiwify**                | ~8.99% + taxas câmbio | **~$1.230–1.400** (estimado¹)     | **~$4.920–5.600**           |
| **YBR Starter ($39/mês)** | $0%                   | **$39** (mensalidade fixa)        | **$468**                    |
| **YBR Growth ($79/mês)**  | $0%                   | **$79** (mensalidade fixa)        | **$948**                    |

> ¹ Kiwify é focado em BRL; vendas internacionais em USD adicionam taxas de conversão de câmbio que aumentam o custo efetivo.

**Economia da cliente migrando do Hotmart para YBR Starter:**

- Por lançamento: **$1.357 → $39** = economia de **$1.318 por lançamento**
- No ano (4 lançamentos): economia de **$4.960/ano**

### Cenário B — Cursos menores ($47/aluno, meta de 100 alunos)

| Plataforma                | Custo por lançamento | Custo anual (6 lançamentos) |
| ------------------------- | -------------------- | --------------------------- |
| **Hotmart** (9.9%)        | $465                 | **$2.790**                  |
| **YBR Starter ($39/mês)** | $39                  | **$468**                    |

> Em cursos menores e frequentes, a economia percentual é ainda mais impactante.

### Argumento de vendas direto para a cliente

> _"No Hotmart você pagou ~$1.357 de taxa no seu último lançamento de 100 alunos. Na YBR Platform você pagaria $39 por mês — independente de quantos alunos entrar. Com 4 lançamentos no ano, você economizaria quase $5.000. E sua plataforma tem a sua cara, sem nenhuma menção ao Hotmart."_

---

## Projeção de Receita YBR (Modelo A — USD)

| Período  | Criadores | Plano médio | Receita/mês | Custo infra | Lucro/mês   |
| -------- | --------- | ----------- | ----------- | ----------- | ----------- |
| Mês 1–3  | 1         | Starter $39 | **$39**     | ~$13        | **~$26**    |
| Mês 4–6  | 2         | Starter $39 | **$78**     | ~$26        | **~$52**    |
| Mês 7–12 | 5         | Growth $79  | **$395**    | ~$80        | **~$315**   |
| Ano 2    | 15        | Growth $79  | **$1.185**  | ~$240       | **~$945**   |
| Ano 2+   | 30        | Growth $79  | **$2.370**  | ~$500       | **~$1.870** |

> ✅ **Break-even a partir do segundo criador.** Margem de ~80% em escala.

---

---

## Análise de Risco por Modelo

| Modelo              | Risco para YBR           | Risco para o criador       | Simplicidade |
| ------------------- | ------------------------ | -------------------------- | ------------ |
| A — Por alunos      | Baixo                    | Baixo                      | ⭐⭐⭐⭐⭐   |
| B — Flat            | Médio (sem upgrade path) | Baixo                      | ⭐⭐⭐⭐⭐   |
| C — Por recursos    | Baixo                    | Alto (surpresas na fatura) | ⭐⭐         |
| D — Mensalidade + % | N/A (inviável no MVP)    | Médio                      | ⭐⭐⭐       |
| E — Freemium        | Alto (custo sem receita) | Baixo                      | ⭐⭐⭐⭐     |

---

## Recomendação

### Para o MVP (primeiro cliente)

**Modelo A — Mensalidade por número de alunos ativos**, valores em USD:

```
Starter  → $39/mês  → até 500 alunos ativos
Growth   → $79/mês  → até 2.000 alunos ativos
Pro      → $139/mês → até 10.000 alunos ativos
```

**Rationale:**

1. Para a primeira cliente (100 alunos, curso a $137): **$39/mês vs ~$1.357 em taxas no Hotmart** — argumento de venda irrefutável
2. USD como moeda de cobrança: alinhado com o mercado da cliente e universal para futuros criadores internacionais
3. Posicionamento entre Teachable ($29–$69) e Thinkific ($36–$149) — preço competitivo com mais white-label
4. Upgrade path natural: conforme a base de alunos cresce, o plano evolui
5. Break-even imediato: $39 receita vs ~$13 custo de infra = ~$26 de margem desde o primeiro cliente

### Para o MVP — Cobrança do primeiro cliente

> **Cobrança manual** (conforme acordado). Nenhuma lógica de billing precisa ser implementada agora.  
> Contrato com a primeira cliente: **$39/mês** (Plano Starter) — a definir na negociação.

### Para Fase 2 — Automação de Billing

Quando tivermos 3+ criadores:

- Stripe Billing para cobranças automáticas em USD
- Painel YBR Admin com status de pagamento por criador e MRR
- Upgrade automático de plano quando active students count cruza o threshold

### Para Fase 3 — Modelo Híbrido (opcional)

Se unificarmos com o sistema de checkout:

- Adicionar take rate sobre transações processadas
- Oferecer desconto na mensalidade como incentivo ao uso do checkout integrado

---

## Próximos Passos

- [ ] Decisão: confirmar Modelo A ($39/$79/$139 USD) como oficial
- [ ] Decisão: confirmar valor da mensalidade para o contrato com a primeira cliente
- [ ] Fase 2: implementar Stripe Billing para automação de cobrança
- [ ] Fase 3: avaliar unificação dos projetos de checkout + plataforma

---

## Infraestrutura Revisada (custos otimizados para MVP)

Nenhum serviço contratado ainda — usando tiers gratuitos/baratos para o MVP:

| Serviço                | Opção Original          | **Opção Otimizada**            | Custo MVP      |
| ---------------------- | ----------------------- | ------------------------------ | -------------- |
| PostgreSQL             | Neon Launch $19/mês     | **Neon Free** (0.5GB)          | **$0**         |
| Redis                  | Upstash Pro             | **Upstash Free** (10k cmd/dia) | **$0**         |
| Frontend (web + admin) | Vercel Pro $20/mês      | **Vercel Hobby**               | **$0**         |
| Backend API            | Railway Pro $20/mês     | **Railway Hobby**              | **$5**         |
| Storage (PDFs, thumbs) | Cloudflare R2 Pay-as-go | **Cloudflare R2 Free** (10GB)  | **$0**         |
| Vídeo                  | Bunny Stream            | **Bunny Stream**               | **~$3–8**      |
| Email                  | Resend Pro              | **Resend Free** (100/dia)      | **$0**         |
| DNS/CDN                | Cloudflare Free         | Cloudflare Free                | **$0**         |
| **TOTAL**              | **~$64–73/mês**         |                                | **~$8–13/mês** |

> **Economia de 80% no custo de infra.** Upgrade seletivo quando 3+ criadores pagantes.

### Bunny Stream — Por que mantemos (não migramos para Mux ainda)

| Critério             | Bunny Stream  | Mux             | Cloudflare Stream |
| -------------------- | ------------- | --------------- | ----------------- |
| Storage              | $0.005/GB/mês | incluso         | $5/100GB/mês      |
| Delivery             | $0.01/GB      | $0.00315/min    | $1/1.000min       |
| 200 alunos, 3 cursos | **~$3–8/mês** | **~$15–30/mês** | **~$8–15/mês**    |
| Player customizado   | ✅ (já temos) | SDK próprio     | ✅                |

> Mux faz sentido em escala quando analytics avançado e legendas automáticas justificam o custo (~2–4× mais caro). Threshold estimado: 1.000+ alunos por criador.
