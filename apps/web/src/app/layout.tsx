import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { BrandingProvider } from '@/context/branding-context'
import { routing } from '@/i18n/routing'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Plataforma de Cursos',
    template: '%s | Plataforma',
  },
  description: 'Plataforma de cursos online',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://ybr-platform.com'),
}

interface RootLayoutProps {
  children: React.ReactNode
}

interface BrandingData {
  brandName: string | null
  logoUrl: string | null
  primaryColor: string
  onPrimaryColor: string
  accentColor: string
  onAccentColor: string
  sidebarBgColor: string
  onSidebarColor: string
}

const DEFAULTS: BrandingData = {
  brandName: null,
  logoUrl: null,
  primaryColor: '#6366f1',
  onPrimaryColor: '#ffffff',
  accentColor: '#10b981',
  onAccentColor: '#ffffff',
  sidebarBgColor: '#1c1917',
  onSidebarColor: '#f5f5f4',
}

const SUPPORTED_LOCALES = routing.locales as readonly string[]

const fetchBranding = async (): Promise<BrandingData> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002'
  try {
    const response = await fetch(`${apiUrl}/branding`, {
      next: { revalidate: 300 },
    })
    if (!response.ok) return DEFAULTS
    const body = await response.json()
    const d = body.data ?? {}
    return {
      brandName: d.brandName ?? null,
      logoUrl: d.logoUrl ?? null,
      primaryColor: d.primaryColor ?? DEFAULTS.primaryColor,
      onPrimaryColor: d.onPrimaryColor ?? DEFAULTS.onPrimaryColor,
      accentColor: d.accentColor ?? DEFAULTS.accentColor,
      onAccentColor: d.onAccentColor ?? DEFAULTS.onAccentColor,
      sidebarBgColor: d.sidebarBgColor ?? DEFAULTS.sidebarBgColor,
      onSidebarColor: d.onSidebarColor ?? DEFAULTS.onSidebarColor,
    }
  } catch {
    return DEFAULTS
  }
}

const RootLayout = async ({ children }: RootLayoutProps) => {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('ybr_locale')?.value
  const locale =
    cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale) ? cookieLocale : routing.defaultLocale

  const messages = await getMessages()
  const branding = await fetchBranding()

  return (
    <html
      lang={locale}
      className={inter.variable}
      suppressHydrationWarning
      style={
        {
          '--color-primary': branding.primaryColor,
          '--color-on-primary': branding.onPrimaryColor,
          '--color-accent': branding.accentColor,
          '--color-on-accent': branding.onAccentColor,
          '--color-sidebar-bg': branding.sidebarBgColor,
          '--color-on-sidebar': branding.onSidebarColor,
        } as React.CSSProperties
      }
    >
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <BrandingProvider brandName={branding.brandName} logoUrl={branding.logoUrl}>
            {children}
          </BrandingProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export default RootLayout
