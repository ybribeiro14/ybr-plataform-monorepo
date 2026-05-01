'use client'

import { HLSPlayer } from '@ybr/hls-player'
import { useEffect, useRef } from 'react'
import { updateLessonProgress } from '@/lib/api/lessons'
import { useAuthStore } from '@/stores/auth'

const PROGRESS_INTERVAL_MS = 10_000
const DEBOUNCE_MS = 5_000

interface VideoPlayerProps {
  src: string
  poster?: string
  lessonId: string
  initialWatchedSeconds: number
  durationSeconds: number | null
  onComplete?: () => void
}

const VideoPlayer = ({
  src,
  poster,
  lessonId,
  initialWatchedSeconds,
  durationSeconds,
  onComplete,
}: VideoPlayerProps) => {
  const { accessToken } = useAuthStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastSaveRef = useRef(0)
  const completedRef = useRef(false)

  // Mutable refs so closures always read the latest values without re-renders
  const accessTokenRef = useRef(accessToken)
  const lessonIdRef = useRef(lessonId)
  const durationRef = useRef(durationSeconds)
  const onCompleteRef = useRef(onComplete)

  accessTokenRef.current = accessToken
  lessonIdRef.current = lessonId
  durationRef.current = durationSeconds
  onCompleteRef.current = onComplete

  const saveProgress = (seconds: number) => {
    const token = accessTokenRef.current
    if (!token) return
    const now = Date.now()
    if (now - lastSaveRef.current < DEBOUNCE_MS) return
    lastSaveRef.current = now
    updateLessonProgress({
      lessonId: lessonIdRef.current,
      watchedSeconds: Math.floor(seconds),
      token,
    }).catch(() => {
      // silently fail — progress saved on next attempt
    })
  }

  const checkAndMarkComplete = (seconds: number) => {
    if (completedRef.current) return
    const duration = durationRef.current
    if (!duration) return
    if (seconds >= duration * 0.9) {
      completedRef.current = true
      onCompleteRef.current?.()
    }
  }

  // Restore initial playback position once the video is ready
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once — initialWatchedSeconds is stable after page load
  useEffect(() => {
    if (initialWatchedSeconds <= 0) return
    const video = containerRef.current?.querySelector('video')
    if (!video) return
    const restore = () => {
      if (video.currentTime < initialWatchedSeconds) {
        video.currentTime = initialWatchedSeconds
      }
    }
    video.addEventListener('canplay', restore, { once: true })
    return () => video.removeEventListener('canplay', restore)
  }, [])

  // Save final progress on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      const video = containerRef.current?.querySelector('video')
      const token = accessTokenRef.current
      if (video && token) {
        updateLessonProgress({
          lessonId: lessonIdRef.current,
          watchedSeconds: Math.floor(video.currentTime),
          token,
        }).catch(() => {})
      }
    }
  }, [])

  const handlePlay = () => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      const video = containerRef.current?.querySelector('video')
      if (!video) return
      saveProgress(video.currentTime)
      checkAndMarkComplete(video.currentTime)
    }, PROGRESS_INTERVAL_MS)
  }

  const handlePause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    const video = containerRef.current?.querySelector('video')
    if (video) saveProgress(video.currentTime)
  }

  const handleEnded = () => {
    handlePause()
    if (!completedRef.current) {
      completedRef.current = true
      onCompleteRef.current?.()
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-inverse-surface rounded-xl overflow-hidden shadow-lg border border-outline-variant"
    >
      <HLSPlayer
        src={src}
        {...(poster ? { poster } : {})}
        controls
        className="w-full h-full"
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
      />
    </div>
  )
}

export type { VideoPlayerProps }
export { VideoPlayer }
