# 12 — Estratégia do Player de Vídeo HLS Customizado

**Data:** 2026-04-24

---

## Visão Geral

A YBR Platform adota o **HLS Player customizado** desenvolvido internamente (localizado em `ybr-plataform/video-player/index.ts`) como pacote compartilhado `packages/hls-player` no monorepo, em vez de utilizar a solução proprietária `@mux/mux-player-react`.

Esta decisão garante **compatibilidade total com Bunny Stream na Fase 1**, controle absoluto sobre a UI para atender ao design system "Artisanal Sophistication", e uma **migração transparente para Mux Video na Fase 2+** — apenas trocando a URL de origem, sem reescrever nenhuma interface.

---

## Análise Comparativa

### HLS Player Customizado vs @mux/mux-player-react

| Critério                             | HLS Player Customizado                                | @mux/mux-player-react                   |
| ------------------------------------ | ----------------------------------------------------- | --------------------------------------- |
| **Dependências**                     | Apenas `hls.js` (~300KB)                              | Mux Player Web Component (~2MB+)        |
| **Compatibilidade de fonte**         | Qualquer URL HLS (Bunny, Mux, S3, Cloudflare)         | Exclusivo para playback IDs do Mux      |
| **Controle de UI**                   | 100% customizável — CSS e DOM próprios                | Tema limitado ao Web Component da Mux   |
| **Integração com design system**     | Nativa via `className` + Tailwind                     | Shadow DOM impede customização profunda |
| **Autoplay Policy**                  | Implementação testada em 30+ cenários de browser      | Delegada à biblioteca da Mux            |
| **Política de redução de movimento** | `prefers-reduced-motion` implementado (WCAG 2.3.3)    | Não documentado                         |
| **Legendas/Captions**                | Suporte nativo via prop `tracks` + elemento `<track>` | Apenas via Mux Robots                   |
| **Fase 1 (Bunny Stream)**            | ✅ Funciona diretamente                               | ❌ Incompatível                         |
| **Fase 2 (Mux Video)**               | ✅ Basta trocar a URL `src`                           | ✅ Nativo                               |
| **Fase 3+ (qualquer CDN)**           | ✅ Agnóstico de provedor                              | ❌ Lock-in no Mux                       |
| **Bundle size**                      | Menor                                                 | Maior                                   |
| **Manutenção**                       | Código interno, sem dependência externa               | Atualizado pela Mux                     |
| **Analytics de vídeo**               | Integração manual com Mux Data (via API)              | Automático com Mux Data                 |

### Decisão Final

O HLS Player customizado é a escolha correta para a YBR Platform porque:

1. **Fase 1 usa Bunny Stream** — `@mux/mux-player-react` é incompatível
2. **Design system rigoroso** — O Shadow DOM do Web Component da Mux impede customização profunda necessária para o tema "Artisanal Sophistication"
3. **Agnosticismo de provedor** — Estratégia híbrida Bunny (previews gratuitos) + Mux (cursos pagos) exige um player universal
4. **Código já existe e está testado** — O player foi desenvolvido e validado em produção em outro produto do ecossistema YBR

---

## Empacotamento como packages/hls-player

### Estrutura do Pacote

```
packages/hls-player/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts          # Export principal
    ├── HLSPlayer.tsx     # Componente principal (copiado de video-player/index.ts)
    └── types.ts          # Tipos exportados
```

### package.json

```json
{
  "name": "@ybr/hls-player",
  "version": "1.0.0",
  "description": "Player HLS customizado da YBR Platform",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "dependencies": {
    "hls.js": "^1.5.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "tsup": "^8.5.0",
    "typescript": "^5.9.0"
  }
}
```

### tsup.config.ts

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  external: ["react", "react-dom"],
  treeshake: true,
});
```

### src/index.ts

```typescript
export { HLSPlayer } from "./HLSPlayer";
export type { HLSPlayerProps, HLSTrackProps } from "./types";
```

### src/types.ts

```typescript
export type HLSTrackProps = {
  src: string;
  srcLang?: string;
  label?: string;
  kind?: "captions" | "subtitles" | "descriptions" | "chapters" | "metadata";
  default?: boolean;
};

export type HLSPlayerProps = {
  /** URL do stream HLS (.m3u8) — obrigatório */
  src: string;
  /** URL da thumbnail exibida antes de reproduzir */
  poster?: string;
  /** Exibir controles nativos do browser */
  controls?: boolean;
  /** Iniciar em loop */
  loop?: boolean;
  /** Largura do player */
  width?: string | number;
  /** Altura do player */
  height?: string | number;
  /** Classes CSS adicionais (Tailwind) */
  className?: string;
  /** Callback de erro do HLS */
  onError?: (event: string, data: unknown) => void;
  /** Callback ao iniciar reprodução */
  onPlay?: () => void;
  /** Callback ao pausar */
  onPause?: () => void;
  /** Callback ao encerrar reprodução */
  onEnded?: () => void;
  /** Callback quando autoplay é bloqueado pelo browser */
  onAutoplayBlocked?: (reason: string) => void;
  /** Fallback para autoplay mudo quando bloqueado (default: true) */
  autoplayFallbackToMuted?: boolean;
  /** Ativar autoplay ao montar o componente */
  autoPlay?: boolean;
  /** Iniciar mutado */
  muted?: boolean;
  /**
   * Prioriza carregamento do poster via preload para otimização LCP.
   * Usar true apenas para o vídeo principal da página.
   */
  priority?: boolean;
  /** Trilhas de legenda/caption */
  tracks?: HLSTrackProps[];
};
```

---

## Código Completo do HLSPlayer

```typescript
// packages/hls-player/src/HLSPlayer.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { preload } from 'react-dom'
import Hls, { type ErrorData } from 'hls.js'
import type { HLSPlayerProps } from './types'

const handleAutoplay = async (
  video: HTMLVideoElement,
  {
    muted,
    autoplayFallbackToMuted,
    onAutoplayBlocked,
  }: {
    muted: boolean
    autoplayFallbackToMuted: boolean
    onAutoplayBlocked?: (reason: string) => void
  }
) => {
  try {
    await video.play()
  } catch (error) {
    const isNotAllowedError =
      error instanceof DOMException &&
      (error.name === 'NotAllowedError' || error.name === 'NotSupportedError')

    if (isNotAllowedError && !muted && autoplayFallbackToMuted) {
      console.info('Autoplay bloqueado pelo browser, tentando com áudio mutado')
      video.muted = true
      try {
        await video.play()
        onAutoplayBlocked?.('Autoplay mutado ativado por política do browser')
      } catch {
        onAutoplayBlocked?.('Autoplay completamente bloqueado pelo browser')
      }
    } else if (isNotAllowedError) {
      onAutoplayBlocked?.('Autoplay bloqueado por política do browser')
    } else {
      onAutoplayBlocked?.('Falha no autoplay')
    }
  }
}

export const HLSPlayer = ({
  src,
  poster,
  autoPlay = false,
  controls = true,
  muted = false,
  loop = false,
  width = '100%',
  height = 'auto',
  className = '',
  onError,
  onPlay,
  onPause,
  onEnded,
  onAutoplayBlocked,
  autoplayFallbackToMuted = true,
  priority = false,
  tracks,
}: HLSPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [effectiveMuted, setEffectiveMuted] = useState(muted)

  useEffect(() => {
    setEffectiveMuted(muted)
  }, [muted])

  // Otimização LCP: precarrega o poster com alta prioridade
  if (priority && poster) {
    preload(poster, { as: 'image', fetchPriority: 'high' })
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // WCAG 2.3.3 / 2.2.2 — respeita preferência de redução de movimento
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true
    const shouldAutoplay = autoPlay && !prefersReducedMotion

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      })

      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, async () => {
        if (shouldAutoplay) {
          await handleAutoplay(video, {
            muted,
            autoplayFallbackToMuted,
            onAutoplayBlocked,
          })
        }
      })

      hls.on(Hls.Events.ERROR, (event, data: ErrorData) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError()
              break
            default:
              hls.destroy()
              break
          }
        }
        onError?.(event, data)
      })

      hlsRef.current = hls
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari nativo suporta HLS sem hls.js
      video.src = src
      if (shouldAutoplay) {
        handleAutoplay(video, { muted, autoplayFallbackToMuted, onAutoplayBlocked })
      }
    } else {
      console.warn('HLS não suportado neste browser', { userAgent: navigator.userAgent })
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [src, autoPlay, effectiveMuted, autoplayFallbackToMuted, onError, onAutoplayBlocked])

  const hasTracks = !!tracks && tracks.length > 0

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      ref={videoRef}
      poster={poster}
      controls={controls}
      muted={effectiveMuted}
      loop={loop}
      playsInline
      preload={priority ? 'auto' : 'metadata'}
      width={width}
      height={height}
      className={className}
      onPlay={onPlay}
      onPause={onPause}
      onEnded={onEnded}
    >
      {hasTracks &&
        tracks!.map((track, i) => (
          <track
            key={`${track.src}-${i}`}
            src={track.src}
            srcLang={track.srcLang}
            label={track.label}
            kind={track.kind ?? 'captions'}
            default={track.default}
          />
        ))}
    </video>
  )
}
```

---

## Exemplos de Uso

### Fase 1 — Bunny Stream

```typescript
// apps/web/src/components/lesson/VideoPlayer.tsx
'use client'

import { HLSPlayer } from '@ybr/hls-player'
import type { HLSTrackProps } from '@ybr/hls-player'

const BUNNY_PULL_ZONE_URL = process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE_URL

interface LessonVideoPlayerProps {
  videoId: string
  poster?: string
  captionsUrl?: string
  onProgress?: (watchedSeconds: number) => void
  className?: string
}

export const LessonVideoPlayer = ({
  videoId,
  poster,
  captionsUrl,
  onProgress,
  className,
}: LessonVideoPlayerProps) => {
  const src = `${BUNNY_PULL_ZONE_URL}${videoId}/playlist.m3u8`

  const tracks: HLSTrackProps[] = captionsUrl
    ? [{ src: captionsUrl, srcLang: 'pt-BR', label: 'Português', kind: 'captions', default: true }]
    : []

  return (
    <HLSPlayer
      src={src}
      poster={poster}
      controls={true}
      muted={false}
      autoPlay={false}
      className={`rounded-xl aspect-video w-full ${className ?? ''}`}
      tracks={tracks}
      onEnded={() => onProgress?.(Infinity)}
    />
  )
}
```

### Fase 2+ — Mux Video (Signed Playback)

```typescript
// apps/web/src/components/lesson/VideoPlayer.tsx
'use client'

import { HLSPlayer } from '@ybr/hls-player'
import type { HLSTrackProps } from '@ybr/hls-player'

interface LessonVideoPlayerProps {
  playbackId: string         // ID de reprodução do Mux
  signedToken: string        // Token assinado (gerado pelo backend, expira em 1h)
  thumbnailToken?: string    // Token para thumbnail segura do Mux
  captionsUrl?: string
  onProgress?: (watchedSeconds: number) => void
  className?: string
}

export const LessonVideoPlayer = ({
  playbackId,
  signedToken,
  thumbnailToken,
  captionsUrl,
  onProgress,
  className,
}: LessonVideoPlayerProps) => {
  // Apenas a URL muda — o componente HLSPlayer não precisa de alteração
  const src = `https://stream.mux.com/${playbackId}.m3u8?token=${signedToken}`
  const poster = thumbnailToken
    ? `https://image.mux.com/${playbackId}/thumbnail.jpg?token=${thumbnailToken}`
    : undefined

  const tracks: HLSTrackProps[] = captionsUrl
    ? [{ src: captionsUrl, srcLang: 'pt-BR', label: 'Português', kind: 'captions', default: true }]
    : []

  return (
    <HLSPlayer
      src={src}
      poster={poster}
      controls={true}
      muted={false}
      autoPlay={false}
      className={`rounded-xl aspect-video w-full ${className ?? ''}`}
      tracks={tracks}
      onEnded={() => onProgress?.(Infinity)}
    />
  )
}
```

### Player como Hero (LCP otimizado)

```typescript
// apps/web/src/app/(sales)/cursos/[slug]/page.tsx
import { HLSPlayer } from '@ybr/hls-player'

// Para vídeo de preview na página de vendas — prioridade LCP
export const CoursePreviewPlayer = ({ previewVideoId }: { previewVideoId: string }) => {
  return (
    <HLSPlayer
      src={`${process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE_URL}${previewVideoId}/playlist.m3u8`}
      poster={`${process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE_URL}${previewVideoId}/thumbnail.jpg`}
      controls={true}
      muted={true}
      autoPlay={true}
      priority={true}  // Precarrega o poster como recurso LCP de alta prioridade
      className="rounded-2xl aspect-video w-full shadow-terracotta"
    />
  )
}
```

### Rastreamento de Progresso

```typescript
// apps/web/src/components/lesson/LessonView.tsx
'use client'

import { useRef, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { HLSPlayer } from '@ybr/hls-player'
import { api } from '@/lib/api-client'

interface LessonViewProps {
  lessonId: string
  videoId: string
  poster?: string
}

export const LessonView = ({ lessonId, videoId, poster }: LessonViewProps) => {
  const lastSavedRef = useRef<number>(0)

  const { mutate: saveProgress } = useMutation({
    mutationFn: (watchedSeconds: number) =>
      api.post('/student/progress', { lessonId, watchedSeconds }),
  })

  const handleTimeUpdate = useCallback((event: Event) => {
    const video = event.target as HTMLVideoElement
    const now = video.currentTime

    // Salva progresso a cada 30 segundos (debounce manual)
    if (now - lastSavedRef.current >= 30) {
      lastSavedRef.current = now
      saveProgress(Math.floor(now))
    }
  }, [saveProgress])

  return (
    <div className="relative">
      <HLSPlayer
        src={`${process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE_URL}${videoId}/playlist.m3u8`}
        poster={poster}
        controls={true}
        className="rounded-xl aspect-video w-full"
        onEnded={() => saveProgress(Infinity)}
      />
    </div>
  )
}
```

---

## Customização com o Tema Artisanal Sophistication

### Wrapper com Design System

O `HLSPlayer` recebe apenas `className` — toda a customização visual é feita via Tailwind no wrapper:

```typescript
// apps/web/src/components/lesson/StyledVideoPlayer.tsx
'use client'

import { HLSPlayer } from '@ybr/hls-player'
import type { HLSPlayerProps } from '@ybr/hls-player'

type StyledVideoPlayerProps = Omit<HLSPlayerProps, 'className'> & {
  variant?: 'lesson' | 'preview' | 'hero'
}

const variantClasses: Record<NonNullable<StyledVideoPlayerProps['variant']>, string> = {
  // Aula: rounded-xl, sombra terracotta sutil
  lesson: 'rounded-xl aspect-video w-full shadow-[0px_4px_20px_rgba(196,99,42,0.12)] bg-[#231915]',
  // Preview: rounded-2xl, sem sombra (usado em cards)
  preview: 'rounded-2xl aspect-video w-full bg-[#231915] overflow-hidden',
  // Hero: rounded-none mobile, rounded-2xl desktop, sombra forte
  hero: 'w-full aspect-video rounded-none md:rounded-2xl shadow-[0px_8px_32px_rgba(152,66,7,0.2)] bg-[#231915]',
}

export const StyledVideoPlayer = ({
  variant = 'lesson',
  ...props
}: StyledVideoPlayerProps) => {
  return (
    <HLSPlayer
      {...props}
      className={variantClasses[variant]}
    />
  )
}
```

### CSS Customizado para Controles Nativos

Os controles nativos do browser podem ser estilizados parcialmente via pseudo-elementos WebKit:

```css
/* apps/web/src/app/globals.css */

/* Estilo dos controles do player — tema Artisanal */
video::-webkit-media-controls-panel {
  background: linear-gradient(
    to top,
    rgba(35, 25, 21, 0.85) 0%,
    transparent 100%
  );
}

video::-webkit-media-controls-play-button,
video::-webkit-media-controls-volume-slider,
video::-webkit-media-controls-timeline {
  filter: brightness(0) invert(1);
  opacity: 0.9;
}

/* Progress bar do player com cor Gold */
video::-webkit-media-controls-timeline {
  accent-color: #fed977;
}
```

---

## Legendas PT-BR — Estratégia

### Fonte das Legendas

| Fase                  | Provedor                   | Método                                                    |
| --------------------- | -------------------------- | --------------------------------------------------------- |
| Fase 1 (Bunny Stream) | Bunny.net + geração manual | Upload de arquivo `.vtt` para o Bunny CDN via API         |
| Fase 2 (Mux Video)    | Mux Robots (IA automática) | Geradas automaticamente e disponibilizadas via URL do Mux |
| Fase 2+ (Premium)     | Deepgram API               | Transcrição de alta qualidade PT-BR via API externa       |

### Formato WebVTT para PT-BR

```
WEBVTT
Kind: captions
Language: pt-BR

00:00:01.000 --> 00:00:04.000
Bem-vindos à aula de confeitaria artesanal.

00:00:04.500 --> 00:00:08.000
Hoje vamos aprender a técnica de temperagem do chocolate.
```

### Upload de Legendas (Bunny Stream)

```typescript
// apps/api/src/functions/video/upload-captions.ts
const uploadCaptionsToBunny = async ({
  videoId,
  vttContent,
  language = "pt-BR",
  label = "Português",
}: {
  videoId: string;
  vttContent: string;
  language?: string;
  label?: string;
}) => {
  const response = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}/captions/${language}`,
    {
      method: "POST",
      headers: {
        AccessKey: BUNNY_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        captionsFile: Buffer.from(vttContent).toString("base64"),
        label,
        srclang: language,
      }),
    },
  );

  return response.ok;
};
```

### Uso com Prop tracks

```typescript
<HLSPlayer
  src={videoUrl}
  tracks={[
    {
      src: 'https://cdn.ybr-platform.com/captions/aula-01-pt-br.vtt',
      srcLang: 'pt-BR',
      label: 'Português (Brasil)',
      kind: 'captions',
      default: true,
    }
  ]}
/>
```

---

## Acessibilidade (WCAG 2.1)

### Critérios Atendidos pelo HLSPlayer

| Critério WCAG                    | Nível | Implementação                                               |
| -------------------------------- | ----- | ----------------------------------------------------------- |
| **1.2.2** Closed Captions        | AA    | Prop `tracks` com elemento `<track kind="captions">`        |
| **1.2.3** Audiodescrição         | A     | Suporte a `<track kind="descriptions">`                     |
| **1.4.4** Redimensionamento      | AA    | Layout responsivo via CSS (não hardcoded)                   |
| **2.1.1** Teclado                | A     | Controles nativos do browser são acessíveis por teclado     |
| **2.2.2** Pausar, Parar, Ocultar | A     | `controls={true}` garante controle do usuário               |
| **2.3.3** Animação por Interação | AAA   | `prefers-reduced-motion` implementado — autoplay desativado |
| **4.1.3** Mensagens de Status    | AA    | `onAutoplayBlocked` notifica o estado ao componente pai     |

### Detalhes da Implementação prefers-reduced-motion

```typescript
// Trecho do HLSPlayer — WCAG 2.3.3 / 2.2.2
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

// Autoplay desativado quando usuário prefere redução de movimento
const shouldAutoplay = autoPlay && !prefersReducedMotion;
```

### Atributo playsInline

O atributo `playsInline` é obrigatório para iOS Safari:

```typescript
// Sempre incluído no elemento <video>
<video
  ref={videoRef}
  playsInline  // ← Evita tela cheia automática no iOS
  // ...
>
```

### Fallback para Browsers sem Suporte HLS

```typescript
// Hierarquia de suporte:
// 1. hls.js (Chrome, Firefox, Edge — todos os browsers modernos)
// 2. HLS nativo (Safari, iOS Safari)
// 3. Aviso de browser incompatível (browsers muito antigos — <0.1% dos usuários)

if (Hls.isSupported()) {
  // Chrome, Firefox, Edge → usa hls.js
} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
  // Safari, iOS → suporte nativo
} else {
  console.warn("HLS não suportado — browser incompatível");
}
```

---

## Integração no pnpm-workspace.yaml

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Adicionando como dependência

```bash
# Em apps/web/package.json
pnpm --filter web add @ybr/hls-player

# Em apps/admin/package.json (se necessário)
pnpm --filter admin add @ybr/hls-player
```

### turbo.json — Pipeline de build

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

O `^build` garante que `@ybr/hls-player` é compilado antes de `web` e `admin`.

---

## Roadmap do Player

### Fase 1 (Bunny Stream)

- [x] Componente base HLSPlayer com hls.js
- [x] Suporte a legendas via prop `tracks`
- [x] Autoplay com fallback para mudo
- [x] Respeito a `prefers-reduced-motion`
- [ ] Empacotar como `packages/hls-player`
- [ ] Integração com Bunny Stream (playlist.m3u8)
- [ ] Upload de legendas .vtt via admin

### Fase 2 (Mux Video)

- [ ] Troca da URL `src` para stream.mux.com (sem mudança no componente)
- [ ] Integração com Mux Signed Tokens no backend
- [ ] Legendas automáticas via Mux Robots
- [ ] Analytics de engajamento via Mux Data API

### Fase 3 (Melhorias Premium)

- [ ] Controles customizados (substituir controles nativos)
- [ ] Thumbnails de preview no hover da timeline
- [ ] Capítulos de vídeo (suporte a `kind="chapters"`)
- [ ] DRM via Mux (Widevine + FairPlay)

---

## Referências

- Código fonte: `ybr-plataform/video-player/index.ts`
- Documentação hls.js: https://github.com/video-dev/hls.js/
- Bunny Stream API: https://docs.bunny.net/reference/api-overview
- Mux Video API: https://docs.mux.com/api-reference
- WCAG 2.1 — Critério 2.3.3: https://www.w3.org/TR/WCAG21/#animation-from-interactions
- MDN HTMLVideoElement: https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement
