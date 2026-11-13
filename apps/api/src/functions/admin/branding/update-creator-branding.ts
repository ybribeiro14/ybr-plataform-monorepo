import { creators, db } from '@ybr/database'
import { eq } from 'drizzle-orm'

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/

interface UpdateCreatorBrandingInput {
  userId: string
  brandName?: string
  primaryColor?: string
  onPrimaryColor?: string
  accentColor?: string
  onAccentColor?: string
  sidebarBgColor?: string
  onSidebarColor?: string
}

const COLOR_FIELDS = [
  'primaryColor',
  'onPrimaryColor',
  'accentColor',
  'onAccentColor',
  'sidebarBgColor',
  'onSidebarColor',
] as const

const updateCreatorBranding = async ({
  userId,
  brandName,
  primaryColor,
  onPrimaryColor,
  accentColor,
  onAccentColor,
  sidebarBgColor,
  onSidebarColor,
}: UpdateCreatorBrandingInput) => {
  const colorValues: Record<string, string | undefined> = {
    primaryColor,
    onPrimaryColor,
    accentColor,
    onAccentColor,
    sidebarBgColor,
    onSidebarColor,
  }

  for (const field of COLOR_FIELDS) {
    const value = colorValues[field]
    if (value !== undefined && !HEX_COLOR_REGEX.test(value)) {
      const error = new Error(`${field} must be a valid hex color (e.g. #3b82f6)`)
      ;(error as Error & { statusCode: number; code: string }).statusCode = 400
      ;(error as Error & { statusCode: number; code: string }).code = 'INVALID_COLOR'
      throw error
    }
  }

  const [creator] = await db
    .select({ id: creators.id })
    .from(creators)
    .where(eq(creators.userId, userId))
    .limit(1)

  if (!creator) {
    const error = new Error('Creator not found')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 404
    ;(error as Error & { statusCode: number; code: string }).code = 'CREATOR_NOT_FOUND'
    throw error
  }

  const cleanUpdates = Object.fromEntries(
    Object.entries({
      brandName,
      primaryColor,
      onPrimaryColor,
      accentColor,
      onAccentColor,
      sidebarBgColor,
      onSidebarColor,
    }).filter(([, v]) => v !== undefined)
  )

  await db
    .update(creators)
    .set({ ...cleanUpdates, updatedAt: new Date() })
    .where(eq(creators.id, creator.id))

  return { success: true }
}

export type { UpdateCreatorBrandingInput }
export { updateCreatorBranding }
