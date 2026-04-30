import {
  boolean,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { users } from "./users";

export const creators = pgTable("creators", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  bio: text("bio"),
  website: varchar("website", { length: 500 }),
  stripeAccountId: varchar("stripe_account_id", { length: 255 }),
  plan: varchar("plan", {
    length: 20,
    enum: ["starter", "growth", "pro", "agency"],
  })
    .notNull()
    .default("starter"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
