import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { courses } from "./courses";

export const courseModules = pgTable("course_modules", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  courseId: varchar("course_id", { length: 36 })
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  position: integer("position").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
