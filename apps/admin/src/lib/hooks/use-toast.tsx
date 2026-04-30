'use client'

import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useState } from 'react'

type ToastVariant = 'default' | 'error' | 'success'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (options: ToastOptions) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, ...options }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>{children}</ToastContext.Provider>
  )
}

const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export type { Toast, ToastVariant }
export { ToastProvider, useToast }
