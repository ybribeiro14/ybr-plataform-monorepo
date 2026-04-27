import { courseModules, courses, db, lessons } from "@ybr/database";
import { asc, eq, inArray } from "drizzle-orm";

interface GetCourseParams {
  courseId: string;
  creatorId: string;
}

const getCourse = async ({ courseId, creatorId }: GetCourseParams) => {
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  if (!course || course.creatorId !== creatorId) {
    const error = new Error("Course not found");
    (error as Error & { statusCode: number; code: string }).statusCode = 404;
    (error as Error & { statusCode: number; code: string }).code =
      "COURSE_NOT_FOUND";
    throw error;
  }

  const modules = await db
    .select()
    .from(courseModules)
    .where(eq(courseModules.courseId, courseId))
    .orderBy(asc(courseModules.position));

  const allLessons =
    modules.length > 0
      ? await db
          .select()
          .from(lessons)
          .where(
            inArray(
              lessons.moduleId,
              modules.map((m) => m.id),
            ),
          )
          .orderBy(asc(lessons.position))
      : [];

  return {
    ...course,
    modules: modules.map((m) => ({
      ...m,
      lessons: allLessons.filter((l) => l.moduleId === m.id),
    })),
  };
};

export { getCourse };
export type { GetCourseParams };
