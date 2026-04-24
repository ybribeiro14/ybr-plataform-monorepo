import {
  boolean,
  integer,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { creators } from "./creators";

export const coupons = pgTable("coupons", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  creatorId: varchar("creator_id", { length: 36 })
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountType: varchar("discount_type", {
    length: 20,
    enum: ["percentage", "fixed"],
  }).notNull(),
  discountValue: integer("discount_value").notNull(), // cents se fixed, 0-100 se percentage
  maxUses: integer("max_uses"), // null = ilimitado
  currentUses: integer("current_uses").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
