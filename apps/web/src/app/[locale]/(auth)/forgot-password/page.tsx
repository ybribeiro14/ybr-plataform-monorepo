'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { ForgotPasswordInput } from '@ybr/schemas'
import { forgotPasswordSchema } from '@ybr/schemas'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { authApi } from '@/lib/api/auth'

const ForgotPasswordPage = () => {
  const t = useTranslations('auth.forgotPassword')
  const params = useParams()
  const locale = params.locale as string

  const [isSuccess, setIsSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const handleFormSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null)
    try {
      await authApi.forgotPassword(data)
      setIsSuccess(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      setServerError(message || 'Ocorreu um erro inesperado. Tente novamente.')
    }
  }

  if (isSuccess) {
    return (
      <div
        className="rounded-xl p-8 shadow-card border text-center"
        style={{
          backgroundColor: '#ffffff',
          borderColor: 'var(--color-outline-variant)',
        }}
      >
        {/* Success icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: 'var(--color-surface-container)' }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--color-primary)' }}
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h2 className="font-serif text-2xl mb-3" style={{ color: 'var(--color-on-surface)' }}>
          E-mail enviado!
        </h2>
        <p
          className="font-sans text-sm leading-relaxed mb-8"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          {t('success')}
        </p>

        <Link
          href={`/${locale}/login`}
          className="font-sans font-semibold text-sm hover:underline transition-all"
          style={{ color: 'var(--color-primary)' }}
        >
          ← {t('backToLogin')}
        </Link>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-8 shadow-card border"
      style={{
        backgroundColor: '#ffffff',
        borderColor: 'var(--color-outline-variant)',
      }}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="font-sans text-3xl mb-2" style={{ color: 'var(--color-on-surface)' }}>
          {t('title')}
        </h1>
        <p
          className="font-sans text-sm leading-relaxed"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          {t('subtitle')}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4">
        {/* Email field */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-sm font-semibold ml-0.5"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            {t('emailLabel')}
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            className="w-full h-12 px-4 rounded-lg border transition-all outline-none placeholder:opacity-50 font-sans text-sm focus:ring-2"
            style={{
              borderColor: errors.email ? 'var(--color-error)' : 'var(--color-outline-variant)',
              backgroundColor: 'var(--color-surface-container)',
              color: 'var(--color-on-surface)',
            }}
          />
          {errors.email && (
            <p className="text-xs ml-0.5" style={{ color: 'var(--color-error)' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Server error */}
        {serverError && (
          <p
            className="text-sm text-center py-2 px-3 rounded-lg"
            style={{
              color: 'var(--color-error)',
              backgroundColor: 'var(--color-error-container)',
            }}
          >
            {serverError}
          </p>
        )}

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-full font-sans font-semibold text-base transition-all active:scale-95 shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
            }}
          >
            {isSubmitting ? '...' : t('submitButton')}
          </button>
        </div>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center">
        <Link
          href={`/${locale}/login`}
          className="font-sans font-semibold text-sm hover:underline transition-all"
          style={{ color: 'var(--color-primary)' }}
        >
          ← {t('backToLogin')}
        </Link>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
