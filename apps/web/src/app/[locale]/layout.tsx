import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'

export const metadata: Metadata = {
  title: {
    default: 'YBR Platform',
    template: '%s | YBR Platform',
  },
  description: 'Online learning platform',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://ybr-platform.com'),
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const { locale } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  const messages = await getMessages()

  return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
}

export default LocaleLayout
