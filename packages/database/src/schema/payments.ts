import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { courses } from "./courses";
import { users } from "./users";

export const payments = pgTable("payments", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  courseId: varchar("course_id", { length: 36 })
    .notNull()
    .references(() => courses.id),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", {
    length: 255,
  }).unique(),
  stripeChargeId: varchar("stripe_charge_id", { length: 255 }),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 3, enum: ["USD", "BRL"] })
    .notNull()
    .default("USD"),
  status: varchar("status", {
    length: 20,
    enum: ["pending", "succeeded", "failed", "refunded"],
  })
    .notNull()
    .default("pending"),
  installments: integer("installments").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
