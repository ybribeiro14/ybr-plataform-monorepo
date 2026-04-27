import { courses, db } from "@ybr/database";
import type { UpdateCourseInput } from "@ybr/schemas";
import { and, eq } from "drizzle-orm";

interface UpdateCourseParams {
  courseId: string;
  creatorId: string;
  data: UpdateCourseInput;
}

const updateCourse = async ({
  courseId,
  creatorId,
  data,
}: UpdateCourseParams) => {
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

  const [updated] = await db
    .update(courses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(courses.id, courseId))
    .returning();

  return updated;
};

export { updateCourse };
export type { UpdateCourseParams };
