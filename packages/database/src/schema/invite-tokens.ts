import { boolean, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { courses } from "./courses";
import { creators } from "./creators";

export const inviteTokens = pgTable("invite_tokens", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  courseId: varchar("course_id", { length: 36 })
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  creatorId: varchar("creator_id", { length: 36 })
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at"), // null = never expires
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
