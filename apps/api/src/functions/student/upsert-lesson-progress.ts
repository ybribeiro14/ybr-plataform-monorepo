import {
  courseModules,
  courses,
  db,
  enrollments,
  lessonProgress,
  lessons,
} from "@ybr/database";
import { and, eq } from "drizzle-orm";

interface UpsertLessonProgressParams {
  lessonId: string;
  userId: string;
  watchedSeconds: number;
}

const upsertLessonProgress = async ({
  lessonId,
  userId,
  watchedSeconds,
}: UpsertLessonProgressParams) => {
  const [row] = await db
    .select({
      durationSeconds: lessons.durationSeconds,
      courseId: courses.id,
    })
    .from(lessons)
    .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
    .innerJoin(courses, eq(courses.id, courseModules.courseId))
    .where(eq(lessons.id, lessonId))
    .limit(1);

  if (!row) {
    const error = new Error("Lesson not found");
    (error as Error & { statusCode: number; code: string }).statusCode = 404;
    (error as Error & { statusCode: number; code: string }).code =
      "LESSON_NOT_FOUND";
    throw error;
  }

  const [enrollment] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, row.courseId),
        eq(enrollments.status, "active"),
      ),
    )
    .limit(1);

  if (!enrollment) {
    const error = new Error("Not enrolled in this course");
    (error as Error & { statusCode: number; code: string }).statusCode = 403;
    (error as Error & { statusCode: number; code: string }).code =
      "NOT_ENROLLED";
    throw error;
  }

  const isCompletionThresholdMet =
    row.durationSeconds !== null && watchedSeconds >= row.durationSeconds * 0.9;

  const [existing] = await db
    .select({ id: lessonProgress.id, completedAt: lessonProgress.completedAt })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lessonId),
      ),
    )
    .limit(1);

  if (existing) {
    const shouldSetCompleted =
      existing.completedAt === null && isCompletionThresholdMet;

    const [updated] = await db
      .update(lessonProgress)
      .set({
        watchedSeconds,
        lastWatchedAt: new Date(),
        ...(shouldSetCompleted ? { completedAt: new Date() } : {}),
      })
      .where(eq(lessonProgress.id, existing.id))
      .returning();

    return {
      watchedSeconds: updated.watchedSeconds,
      completed: updated.completedAt !== null,
      completedAt: updated.completedAt?.toISOString() ?? null,
    };
  }

  const [inserted] = await db
    .insert(lessonProgress)
    .values({
      userId,
      lessonId,
      watchedSeconds,
      lastWatchedAt: new Date(),
      completedAt: isCompletionThresholdMet ? new Date() : null,
    })
    .returning();

  return {
    watchedSeconds: inserted.watchedSeconds,
    completed: inserted.completedAt !== null,
    completedAt: inserted.completedAt?.toISOString() ?? null,
  };
};

export { upsertLessonProgress };
export type { UpsertLessonProgressParams };
