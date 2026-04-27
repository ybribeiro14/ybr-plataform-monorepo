"use client";

import Hls, { type ErrorData } from "hls.js";
import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";

export type HLSTrackProps = {
  src: string;
  srcLang?: string;
  label?: string;
  kind?: "captions" | "subtitles" | "descriptions" | "chapters" | "metadata";
  default?: boolean;
};

export type HLSPlayerProps = {
  src: string;
  poster?: string;
  controls?: boolean;
  loop?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
  onError?: (event: string, data: ErrorData) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onAutoplayBlocked?: (reason: string) => void;
  autoplayFallbackToMuted?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  /** Set to true for LCP videos to prioritize loading */
  priority?: boolean;
  tracks?: HLSTrackProps[];
};

const handleAutoplay = async (
  video: HTMLVideoElement,
  {
    muted,
    autoplayFallbackToMuted,
    onAutoplayBlocked,
  }: {
    muted: boolean;
    autoplayFallbackToMuted: boolean;
    onAutoplayBlocked?: (reason: string) => void;
  },
) => {
  try {
    await video.play();
  } catch (error) {
    const isNotAllowedError =
      error instanceof DOMException &&
      (error.name === "NotAllowedError" || error.name === "NotSupportedError");

    if (isNotAllowedError && !muted && autoplayFallbackToMuted) {
      console.info(
        "Autoplay blocked by browser policy, retrying with muted audio",
      );
      video.muted = true;
      try {
        await video.play();
        console.info("Fallback to muted autoplay succeeded");
        onAutoplayBlocked?.("Autoplayed muted due to browser policy");
      } catch (mutedError) {
        console.error(
          "Autoplay failed even when muted - potential technical issue",
          {
            error: mutedError,
            errorName:
              mutedError instanceof DOMException ? mutedError.name : "Unknown",
          },
        );
        onAutoplayBlocked?.("Autoplay completely blocked by browser");
      }
    } else if (isNotAllowedError) {
      console.info("Autoplay blocked by browser policy", {
        errorName: error instanceof DOMException ? error.name : "Unknown",
        muted,
      });
      onAutoplayBlocked?.("Autoplay blocked by browser policy");
    } else {
      console.error("Unexpected autoplay error - potential technical issue", {
        error,
        errorName: error instanceof DOMException ? error.name : "Unknown",
        muted,
      });
      onAutoplayBlocked?.("Autoplay failed");
    }
  }
};

export const HLSPlayer = ({
  src,
  poster,
  autoPlay = false,
  controls = true,
  muted = false,
  loop = false,
  width = "100%",
  height = "auto",
  className = "",
  onError,
  onPlay,
  onPause,
  onEnded,
  onAutoplayBlocked,
  autoplayFallbackToMuted = true,
  priority = false,
  tracks,
}: HLSPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [effectiveMuted, setEffectiveMuted] = useState(muted);

  useEffect(() => {
    setEffectiveMuted(muted);
  }, [muted]);

  if (priority && poster) {
    preload(poster, { as: "image", fetchPriority: "high" });
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // WCAG 2.3.3 / 2.2.2 — honor prefers-reduced-motion by skipping autoplay
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
    const shouldAutoplay = autoPlay && !prefersReducedMotion;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, async () => {
        if (shouldAutoplay) {
          await handleAutoplay(video, {
            muted,
            autoplayFallbackToMuted,
            ...(onAutoplayBlocked ? { onAutoplayBlocked } : {}),
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
        onError?.(event, data);
      });

      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      if (shouldAutoplay) {
        handleAutoplay(video, {
          muted,
          autoplayFallbackToMuted,
          ...(onAutoplayBlocked ? { onAutoplayBlocked } : {}),
        });
      }
    } else {
      console.warn("HLS not supported in this browser", {
        userAgent: navigator.userAgent,
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [
    src,
    autoPlay,
    effectiveMuted,
    autoplayFallbackToMuted,
    onError,
    onAutoplayBlocked,
  ]);

  const hasTracks = !!tracks && tracks.length > 0;

  return (
    // biome-ignore lint/a11y/useMediaCaption: caller supplies <track> elements when available
    <video
      ref={videoRef}
      poster={poster}
      controls={controls}
      muted={effectiveMuted}
      loop={loop}
      playsInline
      preload={priority ? "auto" : "metadata"}
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
            kind={track.kind ?? "captions"}
            default={track.default}
          />
        ))}
    </video>
  );
};
