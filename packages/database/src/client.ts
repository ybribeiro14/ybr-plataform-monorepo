import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const createDb = () => {
  const databaseUrl = process.env["DATABASE_URL"];

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const client = postgres(databaseUrl);
  return drizzle(client, { schema });
};

export const db = createDb();

export type Database = typeof db;
