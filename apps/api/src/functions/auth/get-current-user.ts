import { db, users } from '@ybr/database'
import { eq } from 'drizzle-orm'

const getCurrentUser = async ({ userId }: { userId: string }) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
    },
  })

  if (!user) {
    const error = new Error('User not found')
    ;(error as Error & { statusCode: number }).statusCode = 404
    throw error
  }

  return user
}

export { getCurrentUser }
