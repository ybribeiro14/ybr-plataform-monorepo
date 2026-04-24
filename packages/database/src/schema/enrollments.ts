import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { courses } from "./courses";
import { payments } from "./payments";
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
  paymentId: varchar("payment_id", { length: 36 }).references(
    () => payments.id,
  ),
  status: varchar("status", {
    length: 20,
    enum: ["active", "expired", "refunded"],
  })
    .notNull()
    .default("active"),
  expiresAt: timestamp("expires_at"), // null = lifetime access
  enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});
