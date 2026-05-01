import { db, studentProfiles, users } from '@ybr/database'
import { eq } from 'drizzle-orm'

interface UpdateProfileInput {
  userId: string
  name?: string
  phone?: string
  cpf?: string
  birthDate?: string
  gender?: string
  bio?: string
  country?: string
  zipCode?: string
  street?: string
  streetNumber?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  linkedinUrl?: string
  instagramHandle?: string
}

const updateStudentProfile = async (input: UpdateProfileInput): Promise<void> => {
  const { userId, name, ...profileFields } = input

  if (name !== undefined) {
    await db.update(users).set({ name, updatedAt: new Date() }).where(eq(users.id, userId))
  }

  const profileUpdateData = {
    ...profileFields,
    updatedAt: new Date(),
  }

  // Calculate profile completeness: phone is the only required field
  const currentPhone = profileFields.phone
  if (currentPhone !== undefined) {
    Object.assign(profileUpdateData, {
      isProfileComplete: currentPhone.trim().length > 0,
    })
  } else {
    // If phone not in this update, check current DB value
    const existing = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, userId),
      columns: { phone: true },
    })
    Object.assign(profileUpdateData, {
      isProfileComplete: Boolean(existing?.phone && existing.phone.trim().length > 0),
    })
  }

  const existing = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, userId),
    columns: { id: true },
  })

  if (existing) {
    await db
      .update(studentProfiles)
      .set(profileUpdateData)
      .where(eq(studentProfiles.userId, userId))
  } else {
    await db.insert(studentProfiles).values({
      userId,
      ...profileUpdateData,
    })
  }
}

export type { UpdateProfileInput }
export { updateStudentProfile }
