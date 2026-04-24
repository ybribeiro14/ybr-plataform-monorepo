import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { courses } from "./courses";
import { enrollments } from "./enrollments";
import { users } from "./users";

export const certificates = pgTable("certificates", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  courseId: varchar("course_id", { length: 36 })
    .notNull()
    .references(() => courses.id),
  enrollmentId: varchar("enrollment_id", { length: 36 })
    .notNull()
    .references(() => enrollments.id),
  certificateUrl: text("certificate_url"),
  verificationCode: varchar("verification_code", { length: 36 })
    .notNull()
    .unique(),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
});
