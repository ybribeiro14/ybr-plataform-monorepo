# YBR Platform — Visão Geral do Projeto

**Projeto:** Plataforma de Cursos Online Proprietária  
**Data de Criação:** 2026-04-24  
**Status:** Fase de Escopo e Arquitetura  
**Versão:** 1.0

---

## O que é o YBR Platform?

O **YBR Platform** é uma plataforma proprietária de hospedagem e venda de cursos online, desenvolvida pela DIV Brands, com foco inicial em atender a primeira cliente: uma confeiteira brasileira nos Estados Unidos.

O objetivo estratégico de longo prazo é **substituir o Hotmart** como infraestrutura de hospedagem e venda de cursos digitais para os clientes da agência, gerando:

1. **Redução de custo para o produtor** — Hotmart cobra 9.9% de cada venda; nossa plataforma terá custo fixo mensal.
2. **Receita recorrente para a DIV Brands** — MRR (Monthly Recurring Revenue) via SaaS.
3. **Diferencial competitivo** — Experiência personalizada, branded, sem concorrência de outros produtos no checkout.

---

## Índice da Documentação

| Arquivo                                                        | Descrição                                   |
| -------------------------------------------------------------- | ------------------------------------------- |
| [00-overview.md](./00-overview.md)                             | Este documento — visão geral                |
| [01-market-analysis.md](./01-market-analysis.md)               | Análise de mercado e comparação com Hotmart |
| [02-tech-stack.md](./02-tech-stack.md)                         | Stack tecnológica recomendada 2026          |
| [03-architecture.md](./03-architecture.md)                     | Arquitetura completa do sistema             |
| [04-video-hosting.md](./04-video-hosting.md)                   | Análise de players e hospedagem de vídeo    |
| [05-payment-processing.md](./05-payment-processing.md)         | Meios de pagamento e gateways               |
| [06-hosting-infrastructure.md](./06-hosting-infrastructure.md) | Opções de hospedagem e infraestrutura       |
| [07-cost-analysis.md](./07-cost-analysis.md)                   | Análise completa de custos                  |
| [08-differentials.md](./08-differentials.md)                   | Diferenciais vs Hotmart e competidores      |
| [09-project-scope.md](./09-project-scope.md)                   | Escopo do projeto — fases e entregas        |
| [10-design-prompt.md](./10-design-prompt.md)                   | Prompt para ferramenta de AI Design         |

---

## Contexto da Primeira Cliente

**Público-alvo identificado:** Mulheres brasileiras nos EUA (1.775M de brasileiros, ~55% mulheres)  
**Nicho:** Confeitaria brasileira adaptada para ingredientes e leis americanas  
**Mercado principal:** Massachusetts (Framingham, Somerville, Everett)  
**Faixa de preço do curso:** $97–$397 (hero: $197 / 6x $37)  
**Plataforma atual:** Hotmart — 9.9% de comissão por venda

→ Contexto completo em [research/brazilians-us-baking-course/](../research/brazilians-us-baking-course/)

---

## Proposta de Valor Central

> **Para a cliente:** Economize a taxa de 9.9% do Hotmart. Em um volume de $10.000/mês de vendas, isso representa $990/mês a mais no bolso, ou ~$11.880/ano.

> **Para a DIV Brands:** Receita SaaS recorrente, propriedade da plataforma, escalabilidade para múltiplos criadores.
