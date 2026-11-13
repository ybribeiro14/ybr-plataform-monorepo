import { creators, db } from '@ybr/database'

interface PublicBrandingData {
  brandName: string | null
  logoUrl: string | null
  primaryColor: string
  onPrimaryColor: string
  accentColor: string
  onAccentColor: string
  sidebarBgColor: string
  onSidebarColor: string
}

const getPublicBranding = async (): Promise<PublicBrandingData> => {
  const [result] = await db
    .select({
      brandName: creators.brandName,
      logoUrl: creators.logoUrl,
      primaryColor: creators.primaryColor,
      onPrimaryColor: creators.onPrimaryColor,
      accentColor: creators.accentColor,
      onAccentColor: creators.onAccentColor,
      sidebarBgColor: creators.sidebarBgColor,
      onSidebarColor: creators.onSidebarColor,
    })
    .from(creators)
    .limit(1)

  if (!result) {
    return {
      brandName: null,
      logoUrl: null,
      primaryColor: '#6366f1',
      onPrimaryColor: '#ffffff',
      accentColor: '#10b981',
      onAccentColor: '#ffffff',
      sidebarBgColor: '#1c1917',
      onSidebarColor: '#f5f5f4',
    }
  }

  return {
    brandName: result.brandName ?? null,
    logoUrl: result.logoUrl ?? null,
    primaryColor: result.primaryColor ?? '#6366f1',
    onPrimaryColor: result.onPrimaryColor ?? '#ffffff',
    accentColor: result.accentColor ?? '#10b981',
    onAccentColor: result.onAccentColor ?? '#ffffff',
    sidebarBgColor: result.sidebarBgColor ?? '#1c1917',
    onSidebarColor: result.onSidebarColor ?? '#f5f5f4',
  }
}

export type { PublicBrandingData }
export { getPublicBranding }
