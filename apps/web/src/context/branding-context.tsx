'use client'

import { createContext, type ReactNode, useContext } from 'react'

interface BrandingContextValue {
  brandName: string | null
  logoUrl: string | null
}

const BrandingContext = createContext<BrandingContextValue>({
  brandName: null,
  logoUrl: null,
})

interface BrandingProviderProps {
  brandName: string | null
  logoUrl: string | null
  children: ReactNode
}

const BrandingProvider = ({ brandName, logoUrl, children }: BrandingProviderProps) => {
  return <BrandingContext value={{ brandName, logoUrl }}>{children}</BrandingContext>
}

const useBranding = () => useContext(BrandingContext)

export type { BrandingContextValue }
export { BrandingProvider, useBranding }
