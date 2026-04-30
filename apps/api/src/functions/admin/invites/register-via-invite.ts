import { courses, db, enrollments, inviteTokens, users } from "@ybr/database";
import bcrypt from "bcrypt";
import { and, eq } from "drizzle-orm";

interface RegisterViaInviteParams {
  token: string;
  name: string;
  email: string;
  password: string;
}

interface RegisterViaInviteResult {
  userId: string;
  enrollmentId: string;
  courseTitle: string;
  status: "pending";
}

const registerViaInvite = async ({
  token,
  name,
  email,
  password,
}: RegisterViaInviteParams): Promise<RegisterViaInviteResult> => {
  // Validate token
  const [invite] = await db
    .select({
      id: inviteTokens.id,
      courseId: inviteTokens.courseId,
      courseTitle: courses.title,
      expiresAt: inviteTokens.expiresAt,
      isActive: inviteTokens.isActive,
    })
    .from(inviteTokens)
    .innerJoin(courses, eq(inviteTokens.courseId, courses.id))
    .where(eq(inviteTokens.token, token))
    .limit(1);

  if (!invite) {
    const error = new Error("Invite link not found") as Error & {
      statusCode: number;
      code: string;
    };
    error.statusCode = 404;
    error.code = "INVITE_NOT_FOUND";
    throw error;
  }

  if (!invite.isActive) {
    const error = new Error("Invite link is no longer active") as Error & {
      statusCode: number;
      code: string;
    };
    error.statusCode = 410;
    error.code = "INVITE_REVOKED";
    throw error;
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    const error = new Error("Invite link has expired") as Error & {
      statusCode: number;
      code: string;
    };
    error.statusCode = 410;
    error.code = "INVITE_EXPIRED";
    throw error;
  }

  // Check if email already in use
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    // If user exists, check if already enrolled
    const [existingEnrollment] = await db
      .select({ id: enrollments.id, status: enrollments.status })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, existingUser.id),
          eq(enrollments.courseId, invite.courseId),
        ),
      )
      .limit(1);

    if (existingEnrollment) {
      return {
        userId: existingUser.id,
        enrollmentId: existingEnrollment.id,
        courseTitle: invite.courseTitle,
        status: "pending",
      };
    }

    // User exists but not enrolled — create pending enrollment
    const [enrollment] = await db
      .insert(enrollments)
      .values({
        userId: existingUser.id,
        courseId: invite.courseId,
        status: "pending",
      })
      .returning({ id: enrollments.id });

    if (!enrollment) throw new Error("Failed to create enrollment");

    return {
      userId: existingUser.id,
      enrollmentId: enrollment.id,
      courseTitle: invite.courseTitle,
      status: "pending",
    };
  }

  // New user — create account + enrollment atomically
  const passwordHash = await bcrypt.hash(password, 12);

  const [newUser] = await db
    .insert(users)
    .values({ name, email, passwordHash, role: "student" })
    .returning({ id: users.id });

  if (!newUser) throw new Error("Failed to create user");

  const [enrollment] = await db
    .insert(enrollments)
    .values({
      userId: newUser.id,
      courseId: invite.courseId,
      status: "pending",
    })
    .returning({ id: enrollments.id });

  if (!enrollment) throw new Error("Failed to create enrollment");

  return {
    userId: newUser.id,
    enrollmentId: enrollment.id,
    courseTitle: invite.courseTitle,
    status: "pending",
  };
};

export { registerViaInvite };
export type { RegisterViaInviteParams, RegisterViaInviteResult };
