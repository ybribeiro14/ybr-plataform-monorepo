import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { creators } from "./creators";

export const courses = pgTable("courses", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  creatorId: varchar("creator_id", { length: 36 })
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  priceCents: integer("price_cents").notNull().default(0),
  currency: varchar("currency", { length: 3, enum: ["USD", "BRL"] })
    .notNull()
    .default("USD"),
  status: varchar("status", {
    length: 20,
    enum: ["draft", "published", "archived"],
  })
    .notNull()
    .default("draft"),
  language: varchar("language", { length: 10, enum: ["pt-BR", "en-US"] })
    .notNull()
    .default("pt-BR"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
