import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash"),
  name: varchar("name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  role: varchar("role", { length: 20, enum: ["student", "creator", "admin"] })
    .notNull()
    .default("student"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
