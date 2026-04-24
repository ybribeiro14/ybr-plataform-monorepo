# 05 — Meios de Pagamento

**Data:** 2026-04-24

---

## 5.1 Requisitos de Pagamento

Para nossa plataforma atender à cliente confeiteira e futuras expansões:

| Requisito                                      | Prioridade |
| ---------------------------------------------- | ---------- |
| Cartões de crédito US (Visa, Mastercard, Amex) | CRÍTICO    |
| Parcelamento (installments) — 2x a 12x         | ALTO       |
| One-time purchase                              | CRÍTICO    |
| Subscriptions recorrentes                      | MÉDIO      |
| Reembolso em 15 dias                           | CRÍTICO    |
| Checkout customizado/embeddable                | ALTO       |
| Cupons de desconto                             | ALTO       |
| Webhooks robustos                              | CRÍTICO    |
| Conformidade PCI DSS                           | CRÍTICO    |
| Apple Pay / Google Pay                         | MÉDIO      |
| PayPal                                         | BAIXO      |

---

## 5.2 Comparação de Gateways

### Stripe ⭐ (RECOMENDADO)

**Padrão ouro para plataformas SaaS e e-learning**

| Taxa                   | Valor                  |
| ---------------------- | ---------------------- |
| Cartão US padrão       | 2.9% + $0.30           |
| Cartão internacional   | 3.9% + $0.30           |
| American Express       | 3.9% + $0.30           |
| Apple Pay / Google Pay | Mesmas taxas do cartão |
| Chargeback             | $15 por disputa        |
| Reembolso              | Sem taxa adicional     |

**Para $197 de venda:**

- Taxa Stripe: $197 × 2.9% + $0.30 = **$5.01 (2.5%)**
- Receita líquida: **$191.99**

**Comparação com Hotmart para $197:**

- Taxa Hotmart: $197 × 9.9% = **$19.50**
- Receita líquida Hotmart: **$177.50**
- **Economia com Stripe:** $14.49 por venda (**7.4% a mais**)

**Pontos Fortes:**

- API mais completa do mercado
- SDK TypeScript excelente
- Stripe Elements (UI customizável)
- Stripe Checkout (hosted page)
- Webhooks 100% confiáveis
- Dashboard excelente
- Documentação líder de mercado
- Stripe Radar (antifraude com ML)
- Suporte a 135+ moedas
- Conformidade PCI DSS automática
- Stripe Installments para parcelamento (US)

**Parcelamento no Stripe:**

```typescript
// Criação de PaymentIntent com parcelamento
const paymentIntent = await stripe.paymentIntents.create({
  amount: 19700, // $197.00 em centavos
  currency: "usd",
  payment_method_types: ["card"],
  payment_method_options: {
    card: {
      installments: {
        enabled: true, // Habilita BNPL via Stripe
      },
    },
  },
});
```

**Notas sobre Parcelamento nos EUA:**

- Stripe Installments: disponível via Klarna, Afterpay, Affirm
- Taxa adicional: ~4.99% + $0.40 por parcela (pago pelo comprador ou absorvido)
- Alternativa: Oferecer desconto para pagamento à vista como incentivo

---

### Paddle (ALTERNATIVA PARA SaaS GLOBAL)

**Posicionamento:** Merchant of Record — simplifica compliance fiscal global

| Taxa               | Valor                    |
| ------------------ | ------------------------ |
| Padrão             | 5% + $0.50 por transação |
| Impostos incluídos | Sim (MoR)                |

**Quando usar Paddle:**

- Se a plataforma expandir para múltiplos países com VAT/IVA
- Paddle assume responsabilidade fiscal (sem precisar registrar empresa em cada país)
- Mais caro (5% vs 2.9%) mas elimina complexidade tributária

**Para nossa cliente (US only):** Stripe é suficiente e mais barato.

---

### PayPal (COMPLEMENTAR)

- Taxa: 3.49% + $0.49 (padrão US)
- Pior experiência para cursos (não é o foco)
- Incluir como opção secundária apenas se houver demanda
- Muitos usuários brasileiros nos EUA preferem PayPal

**Recomendação:** Adicionar PayPal como método adicional no Stripe Checkout (Stripe suporta PayPal nativo).

---

## 5.3 Estratégia de Checkout

### Opção 1: Stripe Elements (Recomendado para UI customizado)

```tsx
// Checkout embutido na própria plataforma
import { PaymentElement } from "@stripe/react-stripe-js";

const CheckoutForm = () => (
  <form onSubmit={handleSubmit}>
    <PaymentElement /> {/* UI do Stripe, visual customizável */}
    <button type="submit">Comprar agora</button>
  </form>
);
```

**Vantagens:** Checkout no domínio próprio, máxima customização, sem redirect.

### Opção 2: Stripe Checkout (Hosted Page)

Redireciona para `checkout.stripe.com` — mais simples de implementar, menos customizável.

**Recomendação:** Usar Stripe Elements para experiência superior e on-brand.

---

## 5.4 Fluxo de Parcelamento para Brasileiros nos EUA

**Problema:** Brasileiros são culturalmente acostumados com parcelamento. Cursos de $197+ têm conversão menor sem parcelamento.

**Solução no Stripe US:**

| Estratégia          | Como                              | Vantagem                       |
| ------------------- | --------------------------------- | ------------------------------ |
| BNPL via Klarna     | Stripe integra Klarna nativamente | Comprador paga em 3x sem juros |
| BNPL via Afterpay   | Stripe integra Afterpay           | Popular nos EUA                |
| Subscription mensal | Stripe Billing ($37/mês × 6)      | Equivale a 6x de $37           |

**Recomendação de implementação:**

```
Preço do curso: $197 à vista
              OU 6x $37/mês (assinatura que cancela após 6 pagamentos)
              OU 3x sem juros via Klarna
```

O modelo de **assinatura com cancelamento automático** é o mais limpo tecnicamente e sem taxas extras de BNPL.

---

## 5.5 Webhooks e Eventos de Pagamento

### Eventos Críticos para Ouvir

```typescript
// Stripe Webhook Events
const criticalEvents = [
  "payment_intent.succeeded", // → Criar enrollment
  "payment_intent.payment_failed", // → Notificar usuário
  "charge.dispute.created", // → Alertar admin
  "customer.subscription.deleted", // → Expirar acesso (plano mensal)
  "invoice.payment_failed", // → Tentativa de cobrança falhou
  "refund.created", // → Expirar enrollment
];
```

### Segurança dos Webhooks

```typescript
// Validar assinatura do Stripe antes de processar
const event = stripe.webhooks.constructEvent(
  req.rawBody,
  req.headers["stripe-signature"],
  process.env.STRIPE_WEBHOOK_SECRET,
);
```

---

## 5.6 Política de Reembolso

**Recomendação:** 15 dias sem perguntas (alinha com estratégia da primeira cliente)

```
Implementação:
- Botão "Solicitar reembolso" na área do aluno (dentro de 15 dias)
- Reembolso processado automaticamente via Stripe API
- Enrollment expirado imediatamente após reembolso
- Email de confirmação enviado via Resend
```

---

## 5.7 Fluxo de Split de Pagamento (Futuro Multi-Tenancy)

Quando a plataforma tiver múltiplos criadores, usar **Stripe Connect**:

```
Aluno paga $197
    ↓
Stripe cobra 2.9% + $0.30 = $5.01
    ↓
YBR Platform retém $49 (taxa da plataforma)
    ↓
Criador recebe $142.99
```

Stripe Connect permite splits automáticos e pagamentos para múltiplas contas.

---

## 5.8 Análise de ROI vs Hotmart

| Cenário      | Volume Mensal | Taxa Hotmart | Taxa Stripe         | Economia Mensal |
| ------------ | ------------- | ------------ | ------------------- | --------------- |
| Inicial      | $3.000        | $297         | $87 + plataforma    | ~$160           |
| Crescendo    | $8.000        | $792         | $232 + plataforma   | ~$510           |
| Estabelecida | $20.000       | $1.980       | $580 + plataforma   | ~$1.350         |
| Referência   | $50.000       | $4.950       | $1.450 + plataforma | ~$3.450         |

_Plataforma assumindo $99/mês (Growth Plan)_

**Break-even:** A plataforma se paga quando o criador tem ~$700/mês de vendas no Hotmart.
