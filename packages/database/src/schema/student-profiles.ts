import {
  boolean,
  date,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { users } from "./users";

export const studentProfiles = pgTable("student_profiles", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),

  // Personal data
  phone: varchar("phone", { length: 30 }),
  cpf: varchar("cpf", { length: 14 }),
  birthDate: date("birth_date"),
  gender: varchar("gender", {
    length: 20,
    enum: ["female", "male", "nonbinary", "prefer_not_to_say"],
  }),
  bio: text("bio"),

  // Address — country-aware (BR + US compatible)
  country: varchar("country", { length: 2 }).default("BR"),
  zipCode: varchar("zip_code", { length: 10 }),
  street: varchar("street", { length: 255 }),
  streetNumber: varchar("street_number", { length: 20 }),
  complement: varchar("complement", { length: 100 }),
  neighborhood: varchar("neighborhood", { length: 100 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),

  // Social links
  linkedinUrl: varchar("linkedin_url", { length: 500 }),
  instagramHandle: varchar("instagram_handle", { length: 100 }),

  // Profile completeness flag — true when phone is filled
  isProfileComplete: boolean("is_profile_complete").notNull().default(false),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
