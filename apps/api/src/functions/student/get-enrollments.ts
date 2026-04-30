import {
  courseModules,
  courses,
  db,
  enrollments,
  lessonProgress,
  lessons,
} from "@ybr/database";
import { and, count, eq, isNotNull } from "drizzle-orm";

interface GetEnrollmentsParams {
  userId: string;
}

interface EnrollmentWithProgress {
  enrollmentId: string;
  courseId: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  enrolledAt: Date;
}

const getEnrollments = async ({
  userId,
}: GetEnrollmentsParams): Promise<EnrollmentWithProgress[]> => {
  const rows = await db
    .select({
      enrollmentId: enrollments.id,
      courseId: courses.id,
      title: courses.title,
      slug: courses.slug,
      thumbnailUrl: courses.thumbnailUrl,
      enrolledAt: enrollments.enrolledAt,
      totalLessons: count(lessons.id),
      completedLessons: count(lessonProgress.id),
    })
    .from(enrollments)
    .innerJoin(courses, eq(courses.id, enrollments.courseId))
    .innerJoin(courseModules, eq(courseModules.courseId, courses.id))
    .innerJoin(lessons, eq(lessons.moduleId, courseModules.id))
    .leftJoin(
      lessonProgress,
      and(
        eq(lessonProgress.lessonId, lessons.id),
        eq(lessonProgress.userId, userId),
        isNotNull(lessonProgress.completedAt),
      ),
    )
    .where(
      and(eq(enrollments.userId, userId), eq(enrollments.status, "active")),
    )
    .groupBy(
      enrollments.id,
      courses.id,
      courses.title,
      courses.slug,
      courses.thumbnailUrl,
      enrollments.enrolledAt,
    );

  return rows.map((row) => {
    const total = row.totalLessons;
    const completed = row.completedLessons;
    const progressPercent =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      enrollmentId: row.enrollmentId,
      courseId: row.courseId,
      title: row.title,
      slug: row.slug,
      thumbnailUrl: row.thumbnailUrl,
      totalLessons: total,
      completedLessons: completed,
      progressPercent,
      enrolledAt: row.enrolledAt,
    };
  });
};

export { getEnrollments };
export type { EnrollmentWithProgress, GetEnrollmentsParams };
