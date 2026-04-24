import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { courseModules } from "./modules";

export const lessons = pgTable("lessons", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  moduleId: varchar("module_id", { length: 36 })
    .notNull()
    .references(() => courseModules.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  // Fase 1: Bunny Stream
  bunnyVideoId: varchar("bunny_video_id", { length: 255 }),
  // Fase 2+: Mux Video
  muxAssetId: varchar("mux_asset_id", { length: 255 }),
  muxPlaybackId: varchar("mux_playback_id", { length: 255 }),
  durationSeconds: integer("duration_seconds"),
  position: integer("position").notNull().default(0),
  isFreePreview: boolean("is_free_preview").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
