import { courseModules, courses, db, lessons } from "@ybr/database";
import type { UpdateLessonInput } from "@ybr/schemas";
import { eq } from "drizzle-orm";

interface UpdateLessonParams {
  lessonId: string;
  creatorId: string;
  data: UpdateLessonInput;
}

const updateLesson = async ({
  lessonId,
  creatorId,
  data,
}: UpdateLessonParams) => {
  const [lessonWithCourse] = await db
    .select({ id: lessons.id, creatorId: courses.creatorId })
    .from(lessons)
    .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
    .innerJoin(courses, eq(courses.id, courseModules.courseId))
    .where(eq(lessons.id, lessonId))
    .limit(1);

  if (!lessonWithCourse || lessonWithCourse.creatorId !== creatorId) {
    const error = new Error("Lesson not found");
    (error as Error & { statusCode: number; code: string }).statusCode = 404;
    (error as Error & { statusCode: number; code: string }).code =
      "LESSON_NOT_FOUND";
    throw error;
  }

  const [updated] = await db
    .update(lessons)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(lessons.id, lessonId))
    .returning();

  return updated;
};

export { updateLesson };
export type { UpdateLessonParams };
