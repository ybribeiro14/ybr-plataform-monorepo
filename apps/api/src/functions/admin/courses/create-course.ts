import { courses, db } from "@ybr/database";
import type { CreateCourseInput } from "@ybr/schemas";
import { like } from "drizzle-orm";

interface CreateCourseParams extends CreateCourseInput {
  creatorId: string;
}

const generateSlug = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const createCourse = async ({
  creatorId,
  title,
  description,
  priceCents,
  currency,
  language,
}: CreateCourseParams) => {
  const baseSlug = generateSlug(title);

  const existingSlugs = await db
    .select({ slug: courses.slug })
    .from(courses)
    .where(like(courses.slug, `${baseSlug}%`));

  let slug = baseSlug;
  if (existingSlugs.some((s) => s.slug === slug)) {
    let counter = 1;
    while (existingSlugs.some((s) => s.slug === `${baseSlug}-${counter}`)) {
      counter++;
    }
    slug = `${baseSlug}-${counter}`;
  }

  const [course] = await db
    .insert(courses)
    .values({
      creatorId,
      title,
      slug,
      description,
      priceCents,
      currency,
      language,
      status: "draft",
    })
    .returning();

  return course;
};

export { createCourse };
export type { CreateCourseParams };
