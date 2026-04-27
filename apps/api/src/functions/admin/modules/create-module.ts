import { courseModules, courses, db } from "@ybr/database";
import type { CreateModuleInput } from "@ybr/schemas";
import { and, eq, max } from "drizzle-orm";

interface CreateModuleParams extends CreateModuleInput {
  courseId: string;
  creatorId: string;
}

const createModule = async ({
  courseId,
  creatorId,
  title,
  description,
  position,
}: CreateModuleParams) => {
  const [course] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(and(eq(courses.id, courseId), eq(courses.creatorId, creatorId)))
    .limit(1);

  if (!course) {
    const error = new Error("Course not found");
    (error as Error & { statusCode: number; code: string }).statusCode = 404;
    (error as Error & { statusCode: number; code: string }).code =
      "COURSE_NOT_FOUND";
    throw error;
  }

  let resolvedPosition = position;

  if (resolvedPosition === undefined) {
    const [maxResult] = await db
      .select({ maxPosition: max(courseModules.position) })
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId));

    resolvedPosition = (maxResult?.maxPosition ?? -1) + 1;
  }

  const [module] = await db
    .insert(courseModules)
    .values({ courseId, title, description, position: resolvedPosition })
    .returning();

  return module;
};

export { createModule };
export type { CreateModuleParams };
