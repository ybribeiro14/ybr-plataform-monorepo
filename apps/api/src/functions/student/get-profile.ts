import { db, studentProfiles, users } from '@ybr/database'
import { eq } from 'drizzle-orm'

interface StudentProfileData {
  userId: string
  name: string
  email: string
  avatarUrl: string | null
  phone: string | null
  cpf: string | null
  birthDate: string | null
  gender: string | null
  bio: string | null
  country: string | null
  zipCode: string | null
  street: string | null
  streetNumber: string | null
  complement: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  linkedinUrl: string | null
  instagramHandle: string | null
  isProfileComplete: boolean
}

const getStudentProfile = async (userId: string): Promise<StudentProfileData> => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
  })

  if (!user) {
    const error = new Error('User not found') as Error & {
      statusCode: number
      code: string
    }
    error.statusCode = 404
    error.code = 'USER_NOT_FOUND'
    throw error
  }

  const profile = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, userId),
  })

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    phone: profile?.phone ?? null,
    cpf: profile?.cpf ?? null,
    birthDate: profile?.birthDate ?? null,
    gender: profile?.gender ?? null,
    bio: profile?.bio ?? null,
    country: profile?.country ?? 'BR',
    zipCode: profile?.zipCode ?? null,
    street: profile?.street ?? null,
    streetNumber: profile?.streetNumber ?? null,
    complement: profile?.complement ?? null,
    neighborhood: profile?.neighborhood ?? null,
    city: profile?.city ?? null,
    state: profile?.state ?? null,
    linkedinUrl: profile?.linkedinUrl ?? null,
    instagramHandle: profile?.instagramHandle ?? null,
    isProfileComplete: profile?.isProfileComplete ?? false,
  }
}

export type { StudentProfileData }
export { getStudentProfile }
