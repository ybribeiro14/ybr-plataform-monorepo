import { creators, db } from '@ybr/database'
import { eq } from 'drizzle-orm'

const getCreatorBranding = async ({ userId }: { userId: string }) => {
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
    .where(eq(creators.userId, userId))
    .limit(1)

  if (!result) {
    const error = new Error('Creator not found')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 404
    ;(error as Error & { statusCode: number; code: string }).code = 'CREATOR_NOT_FOUND'
    throw error
  }

  return result
}

export { getCreatorBranding }
