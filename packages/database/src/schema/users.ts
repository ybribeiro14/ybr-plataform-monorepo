import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash"),
  googleId: varchar("google_id", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  role: varchar("role", { length: 20, enum: ["student", "creator", "admin"] })
    .notNull()
    .default("student"),
  preferredLocale: varchar("preferred_locale", {
    length: 10,
    enum: ["pt-BR", "en"],
  })
    .notNull()
    .default("pt-BR"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
