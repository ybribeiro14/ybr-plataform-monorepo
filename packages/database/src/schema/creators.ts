import {
  boolean,
  date,
  integer,
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
  coursesLimit: integer("courses_limit").default(10),

  // Personal data
  phone: varchar("phone", { length: 30 }),
  cpf: varchar("cpf", { length: 14 }),
  birthDate: date("birth_date"),
  gender: varchar("gender", {
    length: 20,
    enum: ["female", "male", "nonbinary", "prefer_not_to_say"],
  }),

  // Address
  country: varchar("country", { length: 2 }).default("BR"),
  zipCode: varchar("zip_code", { length: 10 }),
  street: varchar("street", { length: 255 }),
  streetNumber: varchar("street_number", { length: 20 }),
  complement: varchar("complement", { length: 100 }),
  neighborhood: varchar("neighborhood", { length: 100 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),

  // Brand identity
  brandName: varchar("brand_name", { length: 255 }),
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color", { length: 7 }).default("#6366f1"),
  onPrimaryColor: varchar("on_primary_color", { length: 7 }).default("#ffffff"),
  accentColor: varchar("accent_color", { length: 7 }).default("#10b981"),
  onAccentColor: varchar("on_accent_color", { length: 7 }).default("#ffffff"),
  sidebarBgColor: varchar("sidebar_bg_color", { length: 7 }).default("#1c1917"),
  onSidebarColor: varchar("on_sidebar_color", { length: 7 }).default("#f5f5f4"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
