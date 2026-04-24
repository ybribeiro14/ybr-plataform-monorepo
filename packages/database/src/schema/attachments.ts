import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { lessons } from "./lessons";

export const lessonAttachments = pgTable("lesson_attachments", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  lessonId: varchar("lesson_id", { length: 36 })
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", {
    length: 20,
    enum: ["pdf", "doc", "spreadsheet", "link"],
  })
    .notNull()
    .default("pdf"),
  fileSizeBytes: integer("file_size_bytes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
