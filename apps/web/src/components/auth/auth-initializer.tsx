'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/stores/auth'

const REFRESH_TOKEN_KEY = 'ybr_refresh_token'

/**
 * Runs once on mount for every page inside the student layout.
 * If the Zustand store already has an accessToken (soft navigation),
 * this is a no-op. Otherwise it reads the refresh token from localStorage,
 * exchanges it for a new access token, fetches /auth/me, and re-hydrates
 * the store — fixing the stuck-loading bug after page reloads / fast refresh.
 */
const AuthInitializer = () => {
  const { accessToken, setAuth } = useAuthStore()
  const router = useRouter()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    if (accessToken) return

    const storedRefreshToken =
      typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null

    if (!storedRefreshToken) {
      router.replace('/login')
      return
    }

    authApi
      .refreshToken(storedRefreshToken)
      .then(({ accessToken: newToken }) =>
        authApi
          .getMe(newToken)
          .then(user => {
            setAuth(user, newToken)
          })
          .catch(() => {
            localStorage.removeItem(REFRESH_TOKEN_KEY)
            router.replace('/login')
          })
      )
      .catch(() => {
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        router.replace('/login')
      })
  }, [accessToken, setAuth, router])

  return null
}

export { AuthInitializer }
