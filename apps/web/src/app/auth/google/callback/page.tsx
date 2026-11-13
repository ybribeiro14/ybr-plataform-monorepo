'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/stores/auth'

const GoogleCallbackContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const { setAuth } = useAuthStore()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const error = searchParams.get('error')

    if (error || !accessToken) {
      router.replace(`/${locale}/login?error=google_failed`)
      return
    }

    // Fetch user info and store auth state
    authApi
      .getMe(accessToken)
      .then(user => {
        setAuth(user, accessToken, refreshToken ?? undefined)
        router.replace(`/${locale}/dashboard`)
      })
      .catch(() => {
        router.replace(`/${locale}/login?error=google_failed`)
      })
  }, [searchParams, router, locale, setAuth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin h-8 w-8 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p className="text-on-surface-variant font-body-md text-body-md">
          Autenticando com Google...
        </p>
      </div>
    </div>
  )
}

const GoogleCallbackPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-on-surface-variant">Carregando...</p>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  )
}

export default GoogleCallbackPage
