import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const createDb = () => {
  const databaseUrl = process.env["DATABASE_URL"];

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
};

export const db = createDb();

export type Database = typeof db;
