import { courses, db, enrollments, users } from "@ybr/database";
import { and, eq } from "drizzle-orm";
import { sendCourseAccessEmail } from "../../infrastructure/email/enrollment-emails";

interface ProcessEnrollmentWebhookParams {
  userId: string;
  courseId: string;
  externalRef?: string;
}

interface EnrollmentResult {
  enrollmentId: string;
  userId: string;
  courseId: string;
  status: string;
  enrolledAt: Date;
}

const processEnrollmentWebhook = async ({
  userId,
  courseId,
  externalRef,
}: ProcessEnrollmentWebhookParams): Promise<EnrollmentResult> => {
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    const error = new Error("User not found") as Error & {
      statusCode: number;
      code: string;
    };
    error.statusCode = 404;
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  const [course] = await db
    .select({ id: courses.id, title: courses.title })
    .from(courses)
    .where(and(eq(courses.id, courseId), eq(courses.status, "published")))
    .limit(1);

  if (!course) {
    const error = new Error("Course not found or not published") as Error & {
      statusCode: number;
      code: string;
    };
    error.statusCode = 404;
    error.code = "COURSE_NOT_FOUND";
    throw error;
  }

  const [existing] = await db
    .select({ id: enrollments.id, status: enrollments.status })
    .from(enrollments)
    .where(
      and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
    )
    .limit(1);

  if (existing) {
    if (existing.status === "active") {
      return {
        enrollmentId: existing.id,
        userId,
        courseId,
        status: existing.status,
        enrolledAt: new Date(),
      };
    }

    const [updated] = await db
      .update(enrollments)
      .set({ status: "active", enrolledAt: new Date() })
      .where(eq(enrollments.id, existing.id))
      .returning();

    if (!updated) throw new Error("Failed to update enrollment");

    // Send course access email (non-blocking)
    sendCourseAccessEmail(user!.email, user!.name, course!.title).catch((err) =>
      console.error("[email] failed to send course access email:", err),
    );

    return {
      enrollmentId: updated.id,
      userId: updated.userId,
      courseId: updated.courseId,
      status: updated.status,
      enrolledAt: updated.enrolledAt,
    };
  }

  const [created] = await db
    .insert(enrollments)
    .values({
      userId,
      courseId,
      status: "active",
      ...(externalRef ? { externalRef } : {}),
    })
    .returning();

  if (!created) throw new Error("Failed to create enrollment");

  // Send course access email (non-blocking)
  sendCourseAccessEmail(user!.email, user!.name, course!.title).catch((err) =>
    console.error("[email] failed to send course access email:", err),
  );

  return {
    enrollmentId: created.id,
    userId: created.userId,
    courseId: created.courseId,
    status: created.status,
    enrolledAt: created.enrolledAt,
  };
};

export { processEnrollmentWebhook };
export type { EnrollmentResult, ProcessEnrollmentWebhookParams };
