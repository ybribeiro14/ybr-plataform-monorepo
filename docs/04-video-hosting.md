# 04 — Hospedagem e Player de Vídeo

**Data:** 2026-04-24 | **Decisão crítica do projeto**

---

## 4.1 Por que a Escolha do Vídeo é Crítica?

O vídeo é **o produto principal** da plataforma. A qualidade da experiência de streaming determina diretamente:

- Taxa de conclusão dos cursos (engajamento do aluno)
- Chargeback/reembolso (aluno frustrado com vídeo que não carrega)
- Percepção de valor da plataforma vs. Hotmart
- Custo de infraestrutura (pode ser o maior custo variável)
- Proteção do conteúdo (pirataria = prejuízo para o criador)

---

## 4.2 Comparação Detalhada dos Provedores

### Mux Video ⭐ (RECOMENDADO)

**Posicionamento:** API-first video infrastructure para developers

| Métrica               | Valor                         |
| --------------------- | ----------------------------- |
| Modelo de preço       | Pay-as-you-go                 |
| Input (encoding)      | Grátis (Basic quality)        |
| Storage (720p)        | $0.0024/min/mês               |
| Delivery (720p)       | $0.0008/min                   |
| Crédito mensal grátis | 100K minutos                  |
| DRM                   | $100/mês + $0.003/play        |
| Free tier             | 10 vídeos + 100K min delivery |

**Estimativa de Custo Mensal (100 vídeos de 10 min, 1.000 alunos/mês):**

- Storage: 1.000 min × $0.0024 = **$2.40**
- Delivery: 1.000 alunos × 10 min × 4 views = 40.000 min × $0.0008 = **$32**
- **Total: ~$35/mês** (sem DRM)

**Pontos Fortes:**

- SDK oficial `@mux/mux-player-react` — integração trivial com Next.js
- Adaptive Bitrate (HLS) automático
- Signed URLs para conteúdo protegido (incluso grátis)
- Analytics de engajamento em nível de vídeo
- Webhook events completos (`video.asset.ready`, `video.asset.errored`)
- **Mux Robots:** IA para legendas automáticas, capítulos, resumos
- Painel de analytics excelente
- Cold Storage automático (60% de desconto para vídeos inativos)
- Trusted por: Patreon, Substack, HubSpot, Typeform

**Pontos Fracos:**

- Custo escala com uso (bom para fase inicial, monitorar em escala)
- DRM caro ($100/mês base)

---

### Bunny Stream (ALTERNATIVA ECONÔMICA)

**Posicionamento:** CDN de alto desempenho com streaming incluído

| Métrica         | Valor                 |
| --------------- | --------------------- |
| Encoding        | **GRÁTIS**            |
| Storage         | $0.01/GB              |
| CDN Delivery    | $0.005–$0.025/GB      |
| Player          | Grátis + customizável |
| DRM (Multi-DRM) | Incluso no Enterprise |
| Trial           | 14 dias grátis        |

**Estimativa de Custo Mensal (mesma carga acima):**

- Storage: 100 vídeos × ~500MB = 50GB × $0.01 = **$0.50**
- Delivery: 40.000 min de streaming × ~250MB/h = ~167GB × $0.005 = **$0.83**
- **Total: ~$1.33/mês** (10–25x mais barato que Mux!)

**Pontos Fortes:**

- **Custo extremamente baixo** — ideal para fase inicial
- Encoding gratuito
- Player customizável incluído
- 119 PoPs globais (250 Tbps de backbone)
- Token authentication incluído
- Hotlink protection
- API simples e bem documentada
- 85.000+ clientes

**Pontos Fracos:**

- Sem SDK oficial para React (mas API REST simples)
- Analytics menos detalhado que Mux
- Sem features de IA (legendas automáticas etc.)
- Community menor comparado ao Mux
- Sem DRM gratuito (apenas Enterprise)

---

### Cloudflare Stream (BOA OPÇÃO)

**Posicionamento:** Streaming simples, dentro do ecossistema Cloudflare

| Métrica        | Valor                                        |
| -------------- | -------------------------------------------- |
| Starter Bundle | $5/mês (1K min storage + 5K min delivery)    |
| Creator Bundle | $50/mês (10K min storage + 50K min delivery) |
| Overage        | Pay-as-you-go                                |
| DRM            | Não disponível                               |
| PoPs           | 330+                                         |

**Estimativa de Custo Mensal:**

- Creator Bundle ($50/mês) cobre cargas iniciais
- Boa integração com outros produtos Cloudflare (CDN, Workers)

**Pontos Fortes:**

- Integração nativa com stack Cloudflare
- 330+ PoPs (o maior dos três)
- Preço previsível no início

**Pontos Fracos:**

- **Sem DRM** — problema para proteção de conteúdo pago
- API menos developer-friendly que Mux
- Menos features de analytics
- Pricing de Storage limitado nos planos iniciais

---

### Vimeo OTT / Wistia (NÃO RECOMENDADO)

| Plataforma                    | Motivo da Eliminação                          |
| ----------------------------- | --------------------------------------------- |
| Vimeo OTT                     | Alto custo ($75–$500/mês) + controle limitado |
| Wistia                        | Focado em marketing, não em LMS/EAD           |
| YouTube (privado)             | Risco de suspensão, sem controle, sem DRM     |
| AWS MediaConvert + CloudFront | Complexidade excessiva, custo alto            |

---

## 4.3 Decisão Recomendada: Estratégia em Dois Estágios

### Fase 1 — Lançamento (Bunny Stream)

**Motivo:** Custo mínimo enquanto a plataforma está construindo base de alunos.

**Configuração:**

- Upload via API Bunny Stream
- Player Bunny nativo (customizado com cores da marca)
- Token Authentication para proteção básica
- Custo estimado: **$3–10/mês** nos primeiros meses

### Fase 2 — Escala (Mux Video)

**Trigger de migração:** Quando MRR > $500/mês ou quando features de IA forem necessárias.

**Motivo:** Mux Robots (legendas automáticas em PT-BR), analytics avançado, SDK React nativo, DRM para proteção premium.

**Alternativa híbrida:** Usar Mux para cursos pagos premium (DRM) + Bunny para previews gratuitos.

---

## 4.4 Player de Vídeo — Frontend

### Opção A: Mux Player React (`@mux/mux-player-react`)

```tsx
import MuxPlayer from "@mux/mux-player-react";

const LessonPlayer = ({
  playbackId,
  title,
}: {
  playbackId: string;
  title: string;
}) => {
  return (
    <MuxPlayer
      playbackId={playbackId}
      metadata={{
        video_title: title,
        viewer_user_id: userId,
      }}
      streamType="on-demand"
      style={{ width: "100%", aspectRatio: "16/9" }}
    />
  );
};
```

**Vantagens:**

- Integração nativa
- Subtítulos automáticos
- Analytics automático (sem código adicional)
- Responsive e acessível por padrão
- Fullscreen, PiP, playback speed

### Opção B: Video.js com Bunny HLS

```tsx
import videojs from "video.js";
// HLS URL do Bunny: https://{hostname}/{videoId}/playlist.m3u8
```

**Nota:** Para Bunny, usar Video.js ou o player nativo do Bunny (`@bunny.net/player`).

---

## 4.5 Proteção de Conteúdo

### Nível 1 — Signed URLs (Mux e Bunny)

- URLs de reprodução expiram em 1–4 horas
- Geradas pelo backend após verificar enrollment ativo
- Impede compartilhamento direto de links

### Nível 2 — Domain Restriction

- Apenas o domínio da plataforma pode reproduzir o vídeo
- Bloqueia embed em outros sites

### Nível 3 — DRM (Mux — Fase 2+)

- Widevine (Chrome, Android) + FairPlay (Safari, iOS)
- Impede download e gravação de tela
- Necessário para cursos de alto valor ($297+)
- Custo adicional: $100/mês base + $0.003/play

### Recomendação para Fase 1

- Signed URLs + Domain Restriction = proteção suficiente para cursos de até $200
- DRM apenas quando cursos atingirem preço > $297 ou quando houver evidência de pirataria

---

## 4.6 Features de IA no Vídeo (Mux Robots)

Disponível na Fase 2 com Mux:

| Feature                | Uso na Plataforma                                 | Custo          |
| ---------------------- | ------------------------------------------------- | -------------- |
| Legendas automáticas   | PT-BR nativo para alunos com deficiência auditiva | Grátis         |
| Tradução de legendas   | EN para novos produtos em inglês                  | Via Mux Robots |
| Capítulos automáticos  | Navegação mais fácil em aulas longas              | Via Mux Robots |
| Resumo de vídeo        | "O que você vai aprender" automático              | Via Mux Robots |
| Thumbnails automáticos | Capas das aulas geradas automaticamente           | Grátis         |

---

## 4.7 Processo de Upload para Criadores

### Fluxo Recomendado (TUS Resumable Upload)

```
1. Criador seleciona arquivo de vídeo no Admin
2. Frontend inicia upload resumível via TUS protocol
3. Backend gera URL de upload direto (Mux ou Bunny)
4. Frontend faz upload direto para o provedor (sem passar pelo servidor)
5. Webhook do provedor notifica o backend quando processamento conclui
6. Backend atualiza status da aula para "ready"
7. Admin exibe thumbnail e preview do vídeo
```

**Benefícios:**

- Upload direto não sobrecarrega o servidor API
- Resumível: pode continuar após queda de conexão
- Progresso em tempo real via EventSource/SSE
