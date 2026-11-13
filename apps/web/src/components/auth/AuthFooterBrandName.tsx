'use client'

import { useBranding } from '@/context/branding-context'

const AuthFooterBrandName = () => {
  const { brandName } = useBranding()
  return <>{brandName ?? 'Plataforma'}</>
}

export { AuthFooterBrandName }
