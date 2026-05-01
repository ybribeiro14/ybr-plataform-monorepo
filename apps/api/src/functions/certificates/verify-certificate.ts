import { certificates, courses, creators, db, users } from '@ybr/database'
import { eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

interface VerifyCertificateResult {
  certificateId: string
  verificationCode: string
  studentName: string
  courseTitle: string
  creatorName: string
  issuedAt: string
  certificateUrl: string | null
}

const throwError = (message: string, statusCode: number, code: string): never => {
  const error = new Error(message) as Error & {
    statusCode: number
    code: string
  }
  error.statusCode = statusCode
  error.code = code
  throw error
}

const verifyCertificate = async (verificationCode: string): Promise<VerifyCertificateResult> => {
  // Use aliased tables to distinguish student user vs creator user
  const studentUsers = alias(users, 'student_users')
  const creatorUsers = alias(users, 'creator_users')

  const [row] = await db
    .select({
      id: certificates.id,
      verificationCode: certificates.verificationCode,
      certificateUrl: certificates.certificateUrl,
      issuedAt: certificates.issuedAt,
      studentName: studentUsers.name,
      courseTitle: courses.title,
      creatorName: creatorUsers.name,
    })
    .from(certificates)
    .innerJoin(studentUsers, eq(certificates.userId, studentUsers.id))
    .innerJoin(courses, eq(certificates.courseId, courses.id))
    .innerJoin(creators, eq(courses.creatorId, creators.id))
    .innerJoin(creatorUsers, eq(creators.userId, creatorUsers.id))
    .where(eq(certificates.verificationCode, verificationCode))
    .limit(1)

  if (!row) {
    throwError('Certificate not found', 404, 'CERTIFICATE_NOT_FOUND')
  }

  return {
    certificateId: row!.id,
    verificationCode: row!.verificationCode,
    studentName: row!.studentName,
    courseTitle: row!.courseTitle,
    creatorName: row!.creatorName,
    issuedAt: row!.issuedAt.toISOString(),
    certificateUrl: row!.certificateUrl,
  }
}

export type { VerifyCertificateResult }
export { verifyCertificate }
