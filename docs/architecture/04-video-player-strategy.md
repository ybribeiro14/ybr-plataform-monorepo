# 04 — Video Player Strategy — Custom HLS Player

**Date:** 2026-04-24 | **Decision: Custom HLS Player over @mux/mux-player-react**

---

## Overview

YBR Platform adopts the **custom HLS Player** developed in-house (source at `ybr-plataform/video-player/index.ts`) as a shared package `packages/hls-player` in the monorepo, instead of the proprietary `@mux/mux-player-react` solution.

This decision ensures **full compatibility with Bunny Stream in Phase 1**, absolute control over the UI to match the "Artisanal Sophistication" design system, and a **transparent migration to Mux Video in Phase 2+** — only changing the source URL, without rewriting any UI.

---

## Comparative Analysis

### Custom HLS Player vs @mux/mux-player-react

| Criteria                      | Custom HLS Player                                    | @mux/mux-player-react                  |
| ----------------------------- | ---------------------------------------------------- | -------------------------------------- |
| **Dependencies**              | Only `hls.js` (~300KB)                               | Mux Player Web Component (~2MB+)       |
| **Source compatibility**      | Any HLS URL (Bunny, Mux, S3, Cloudflare)             | Exclusive to Mux playback IDs          |
| **UI control**                | 100% customizable — own CSS and DOM                  | Theme limited to Mux Web Component     |
| **Design system integration** | Native via `className` + Tailwind                    | Shadow DOM prevents deep customization |
| **Autoplay policy**           | Implementation tested across 30+ browser scenarios   | Delegated to Mux library               |
| **Reduced motion**            | `prefers-reduced-motion` implemented (WCAG 2.3.3)    | Not documented                         |
| **Subtitles/Captions**        | Native support via `tracks` prop + `<track>` element | Via Mux Robots only                    |
| **Phase 1 (Bunny Stream)**    | ✅ Works directly                                    | ❌ Incompatible                        |
| **Phase 2 (Mux Video)**       | ✅ Just change the `src` URL                         | ✅ Native                              |
| **Phase 3+ (any CDN)**        | ✅ Provider-agnostic                                 | ❌ Mux lock-in                         |
| **Bundle size**               | Smaller                                              | Larger                                 |
| **Maintenance**               | Internal code, no external dependency                | Updated by Mux                         |
| **Video analytics**           | Manual integration with Mux Data (via API)           | Automatic with Mux Data                |

### Final Decision

The custom HLS Player is the right choice for YBR Platform because:

1. **Phase 1 uses Bunny Stream** — `@mux/mux-player-react` is incompatible
2. **Strict design system** — The Mux Web Component's Shadow DOM prevents the deep customization required for "Artisanal Sophistication"
3. **Provider agnosticism** — Hybrid Bunny (free previews) + Mux (paid courses) strategy requires a universal player
4. **Code already exists and is tested** — The player was developed and validated in production in another YBR ecosystem product

---

## Package Structure: packages/hls-player

```
packages/hls-player/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── index.ts          # Main export
    ├── HLSPlayer.tsx     # Main component (adapted from video-player/index.ts)
    └── types.ts          # Exported types
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
  /** HLS stream URL (.m3u8) — required */
  src: string;
  /** Thumbnail URL displayed before playback */
  poster?: string;
  /** Show native browser controls */
  controls?: boolean;
  /** Start in loop mode */
  loop?: boolean;
  /** Player width */
  width?: string | number;
  /** Player height */
  height?: string | number;
  /** Additional CSS classes (Tailwind) */
  className?: string;
  /** HLS error callback */
  onError?: (event: string, data: unknown) => void;
  /** Callback when playback starts */
  onPlay?: () => void;
  /** Callback when paused */
  onPause?: () => void;
  /** Callback when playback ends */
  onEnded?: () => void;
  /** Callback when autoplay is blocked by the browser */
  onAutoplayBlocked?: (reason: string) => void;
  /** Fallback to muted autoplay when blocked (default: true) */
  autoplayFallbackToMuted?: boolean;
  /** Enable autoplay on mount */
  autoPlay?: boolean;
  /** Start muted */
  muted?: boolean;
  /**
   * Prioritize poster image loading for LCP optimization.
   * Use true only for the primary video on the page.
   */
  priority?: boolean;
  /** Subtitle/caption tracks */
  tracks?: HLSTrackProps[];
};
```

---

## Usage Examples

### Phase 1 — Bunny Stream

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

const LessonVideoPlayer = ({
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

export { LessonVideoPlayer }
```

### Phase 2+ — Mux Video (Signed Playback)

```typescript
// Only the URL changes — the HLSPlayer component requires zero modifications
const src = `https://stream.mux.com/${playbackId}.m3u8?token=${signedToken}`
const poster = `https://image.mux.com/${playbackId}/thumbnail.jpg?token=${thumbnailToken}`

return (
  <HLSPlayer
    src={src}
    poster={poster}
    controls={true}
    className="rounded-xl aspect-video w-full"
    tracks={tracks}
  />
)
```

---

## Key Implementation Notes

### WCAG 2.3.3 — Reduced Motion

The player respects `prefers-reduced-motion` to prevent autoplay for users who have enabled this accessibility setting:

```typescript
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
const shouldAutoplay = autoPlay && !prefersReducedMotion;
```

### Autoplay Policy Handling

Browsers block autoplay with sound. The player gracefully falls back to muted autoplay:

```typescript
try {
  await video.play();
} catch (error) {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    if (autoplayFallbackToMuted) {
      video.muted = true;
      await video.play();
      onAutoplayBlocked?.("Muted autoplay activated by browser policy");
    }
  }
}
```

### HLS Fatal Error Recovery

```typescript
hls.on(Hls.Events.ERROR, (event, data) => {
  if (data.fatal) {
    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        hls.startLoad(); // Auto-retry on network errors
        break;
      case Hls.ErrorTypes.MEDIA_ERROR:
        hls.recoverMediaError(); // Attempt media error recovery
        break;
      default:
        hls.destroy(); // Unrecoverable — destroy instance
    }
  }
});
```

### Safari Native HLS

Safari supports HLS natively without hls.js:

```typescript
if (Hls.isSupported()) {
  // Use hls.js for all other browsers
} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
  // Safari: use native HLS support
  video.src = src;
}
```

---

## Source File

The original player source is at: `ybr-plataform/video-player/index.ts`

To use it in the monorepo, copy the component to `packages/hls-player/src/HLSPlayer.tsx` and adapt the export format to match the package structure above.
