import { courseModules, courses, db, lessons } from "@ybr/database";
import { and, eq } from "drizzle-orm";

interface PublishCourseParams {
  courseId: string;
  creatorId: string;
}

const publishCourse = async ({ courseId, creatorId }: PublishCourseParams) => {
  const [existing] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(and(eq(courses.id, courseId), eq(courses.creatorId, creatorId)))
    .limit(1);

  if (!existing) {
    const error = new Error("Course not found");
    (error as Error & { statusCode: number; code: string }).statusCode = 404;
    (error as Error & { statusCode: number; code: string }).code =
      "COURSE_NOT_FOUND";
    throw error;
  }

  // Verify at least one module with at least one lesson exists
  const modulesWithLessons = await db
    .select({ moduleId: courseModules.id })
    .from(courseModules)
    .innerJoin(lessons, eq(lessons.moduleId, courseModules.id))
    .where(eq(courseModules.courseId, courseId))
    .limit(1);

  if (modulesWithLessons.length === 0) {
    const error = new Error(
      "Course must have at least one module with one lesson to be published",
    );
    (error as Error & { statusCode: number; code: string }).statusCode = 400;
    (error as Error & { statusCode: number; code: string }).code = "NO_CONTENT";
    throw error;
  }

  const [updated] = await db
    .update(courses)
    .set({ status: "published", updatedAt: new Date() })
    .where(eq(courses.id, courseId))
    .returning();

  return updated;
};

export { publishCourse };
export type { PublishCourseParams };
