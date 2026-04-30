import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { courses } from "./courses";
import { users } from "./users";

export const enrollments = pgTable("enrollments", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  courseId: varchar("course_id", { length: 36 })
    .notNull()
    .references(() => courses.id),
  status: varchar("status", {
    length: 20,
    enum: ["pending", "active", "expired", "revoked"],
  })
    .notNull()
    .default("active"),
  externalRef: varchar("external_ref", { length: 255 }), // ID from external payment system
  expiresAt: timestamp("expires_at"), // null = lifetime access
  enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});
