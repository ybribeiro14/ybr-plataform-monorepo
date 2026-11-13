import { courses, creators, db, enrollments, users } from "@ybr/database";
import { count, eq } from "drizzle-orm";

interface PlatformStats {
  totalCreators: number;
  activeCreators: number;
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  totalEnrollments: number;
}

const getPlatformStats = async (): Promise<PlatformStats> => {
  const [
    [totalCreatorsRow],
    [activeCreatorsRow],
    [totalCoursesRow],
    [publishedCoursesRow],
    [totalStudentsRow],
    [totalEnrollmentsRow],
  ] = await Promise.all([
    db.select({ value: count() }).from(creators),
    db
      .select({ value: count() })
      .from(creators)
      .where(eq(creators.isActive, true)),
    db.select({ value: count() }).from(courses),
    db
      .select({ value: count() })
      .from(courses)
      .where(eq(courses.status, "published")),
    db.select({ value: count() }).from(users).where(eq(users.role, "student")),
    db
      .select({ value: count() })
      .from(enrollments)
      .where(eq(enrollments.status, "active")),
  ]);

  return {
    totalCreators: totalCreatorsRow?.value ?? 0,
    activeCreators: activeCreatorsRow?.value ?? 0,
    totalCourses: totalCoursesRow?.value ?? 0,
    publishedCourses: publishedCoursesRow?.value ?? 0,
    totalStudents: totalStudentsRow?.value ?? 0,
    totalEnrollments: totalEnrollmentsRow?.value ?? 0,
  };
};

export { getPlatformStats };
export type { PlatformStats };
