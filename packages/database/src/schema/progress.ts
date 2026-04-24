import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { lessons } from "./lessons";
import { users } from "./users";

export const lessonProgress = pgTable("lesson_progress", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lessonId: varchar("lesson_id", { length: 36 })
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  watchedSeconds: integer("watched_seconds").notNull().default(0),
  completedAt: timestamp("completed_at"),
  lastWatchedAt: timestamp("last_watched_at").notNull().defaultNow(),
});
