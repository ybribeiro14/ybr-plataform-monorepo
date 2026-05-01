import type { User } from '@ybr/types'
import { create } from 'zustand'

const ACCESS_TOKEN_COOKIE = 'ybr_access_token'
const REFRESH_TOKEN_KEY = 'ybr_refresh_token'

const setAccessTokenCookie = (token: string) => {
  // biome-ignore lint/suspicious/noDocumentCookie: required for Next.js middleware to read the auth cookie
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${token}; path=/; max-age=900; SameSite=Lax`
}

const clearAccessTokenCookie = () => {
  // biome-ignore lint/suspicious/noDocumentCookie: required for Next.js middleware to clear the auth cookie
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  setAuth: (user: User, accessToken: string, refreshToken?: string) => void
  setUser: (user: User) => void
  logout: () => void
}

const useAuthStore = create<AuthState>(set => ({
  user: null,
  accessToken: null,
  isLoading: false,

  setAuth: (user, accessToken, refreshToken) => {
    setAccessTokenCookie(accessToken)
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
    set({ user, accessToken, isLoading: false })
  },

  setUser: user => {
    set({ user })
  },

  logout: () => {
    clearAccessTokenCookie()
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    set({ user: null, accessToken: null, isLoading: false })
  },
}))

export { useAuthStore }
