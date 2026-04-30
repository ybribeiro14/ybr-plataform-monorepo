import { courses, creators, db, enrollments, users } from "@ybr/database";
import { and, count, eq } from "drizzle-orm";

interface CreatorListItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  plan: string;
  isActive: boolean;
  activeCourses: number;
  activeStudents: number;
  createdAt: Date;
}

const listCreators = async (): Promise<CreatorListItem[]> => {
  const results = await db
    .select({
      id: creators.id,
      userId: creators.userId,
      name: users.name,
      email: users.email,
      plan: creators.plan,
      isActive: creators.isActive,
      createdAt: creators.createdAt,
    })
    .from(creators)
    .innerJoin(users, eq(creators.userId, users.id));

  // Fetch counts per creator
  const items = await Promise.all(
    results.map(async (creator) => {
      const [courseCountRow] = await db
        .select({ value: count() })
        .from(courses)
        .where(
          and(
            eq(courses.creatorId, creator.id),
            eq(courses.status, "published"),
          ),
        );

      const [studentCountRow] = await db
        .select({ value: count() })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(
          and(
            eq(courses.creatorId, creator.id),
            eq(enrollments.status, "active"),
          ),
        );

      return {
        id: creator.id,
        userId: creator.userId,
        name: creator.name,
        email: creator.email,
        plan: creator.plan,
        isActive: creator.isActive,
        activeCourses: courseCountRow?.value ?? 0,
        activeStudents: studentCountRow?.value ?? 0,
        createdAt: creator.createdAt,
      };
    }),
  );

  return items;
};

export { listCreators };
export type { CreatorListItem };
