/**
 * Development seed script — creates baseline users and sample data for local testing.
 *
 * Run with:
 *   pnpm db:seed
 *
 * Seeded accounts:
 *   admin@ybr.dev      / Admin@123456    (role: admin)
 *   criador@ybr.dev    / Criador@123456  (role: creator)
 *   aluno@ybr.dev      / Aluno@123456    (role: student)
 */

import { config } from "dotenv";
import { resolve } from "node:path";

// Load .env from monorepo root before any DB import
config({ path: resolve(process.cwd(), "../../.env") });
config({ path: resolve(process.cwd(), "../../.env.local"), override: true });

import bcrypt from "bcrypt";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { uuidv7 } from "uuidv7";
import * as schema from "./schema";

const { users, creators, courses, courseModules, lessons, enrollments } =
  schema;

// ---------------------------------------------------------------------------
// Credentials
// ---------------------------------------------------------------------------

const SEED_USERS = [
  {
    id: uuidv7(),
    name: "Admin YBR",
    email: "admin@ybr.dev",
    password: "Admin@123456",
    role: "admin" as const,
  },
  {
    id: uuidv7(),
    name: "Criador de Teste",
    email: "criador@ybr.dev",
    password: "Criador@123456",
    role: "creator" as const,
  },
  {
    id: uuidv7(),
    name: "Aluna de Teste",
    email: "aluno@ybr.dev",
    password: "Aluno@123456",
    role: "student" as const,
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const seed = async () => {
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");

  const client = postgres(databaseUrl);
  const db = drizzle(client, { schema });

  console.log("🌱 Starting seed...\n");

  // ------ Users ------
  console.log("👤 Creating users...");
  const createdUsers: Record<string, string> = {};

  for (const seedUser of SEED_USERS) {
    const passwordHash = await bcrypt.hash(seedUser.password, 12);

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(
        // drizzle eq import — inline to avoid circular import issues
        (await import("drizzle-orm")).eq(users.email, seedUser.email),
      )
      .limit(1);

    if (existing) {
      console.log(`  ⚠️  Skipping ${seedUser.email} (already exists)`);
      createdUsers[seedUser.role] = existing.id;
      continue;
    }

    const [user] = await db
      .insert(users)
      .values({
        id: seedUser.id,
        name: seedUser.name,
        email: seedUser.email,
        passwordHash,
        role: seedUser.role,
      })
      .returning({ id: users.id });

    createdUsers[seedUser.role] = user.id;
    console.log(`  ✅  ${seedUser.email} (${seedUser.role})`);
  }

  // ------ Creator profile ------
  const creatorUserId = createdUsers["creator"];

  console.log("\n🎨 Creating creator profile...");
  const { eq } = await import("drizzle-orm");

  const [existingCreator] = await db
    .select({ id: creators.id })
    .from(creators)
    .where(eq(creators.userId, creatorUserId))
    .limit(1);

  let creatorId: string;

  if (existingCreator) {
    console.log("  ⚠️  Creator profile already exists, skipping");
    creatorId = existingCreator.id;
  } else {
    const creatorProfileId = uuidv7();
    await db.insert(creators).values({
      id: creatorProfileId,
      userId: creatorUserId,
      bio: "Instrutora especialista em confeitaria artesanal.",
      plan: "starter",
    });
    creatorId = creatorProfileId;
    console.log(`  ✅  Creator profile created`);
  }

  // ------ Sample course ------
  console.log("\n📚 Creating sample course...");

  const [existingCourse] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.slug, "confeitaria-artesanal-do-zero"))
    .limit(1);

  let courseId: string;

  if (existingCourse) {
    console.log("  ⚠️  Sample course already exists, skipping");
    courseId = existingCourse.id;
  } else {
    const [course] = await db
      .insert(courses)
      .values({
        id: uuidv7(),
        creatorId,
        title: "Confeitaria Artesanal do Zero",
        slug: "confeitaria-artesanal-do-zero",
        description:
          "Aprenda a criar doces e bolos artesanais incríveis do zero, com técnicas profissionais e ingredientes acessíveis.",
        status: "published",
        language: "pt-BR",
      })
      .returning({ id: courses.id });

    courseId = course.id;
    console.log(`  ✅  Course created (id: ${courseId})`);

    // ------ Modules ------
    console.log("\n📦 Creating modules and lessons...");

    const [mod1] = await db
      .insert(courseModules)
      .values({
        id: uuidv7(),
        courseId,
        title: "Módulo 1: Fundamentos",
        description: "Base teórica e prática para começar com segurança.",
        position: 0,
        isPublished: true,
      })
      .returning({ id: courseModules.id });

    const [mod2] = await db
      .insert(courseModules)
      .values({
        id: uuidv7(),
        courseId,
        title: "Módulo 2: Técnicas Avançadas",
        description: "Aprofunde suas habilidades com receitas elaboradas.",
        position: 1,
        isPublished: true,
      })
      .returning({ id: courseModules.id });

    // ------ Lessons (module 1) ------
    await db.insert(lessons).values([
      {
        id: uuidv7(),
        moduleId: mod1.id,
        title: "Bem-vinda ao curso",
        description: "Apresentação da instrutora e visão geral do programa.",
        durationSeconds: 180,
        position: 0,
        isPublished: true,
        isFreePreview: true,
      },
      {
        id: uuidv7(),
        moduleId: mod1.id,
        title: "Equipamentos essenciais",
        description: "Tudo que você precisa ter na sua cozinha.",
        durationSeconds: 540,
        position: 1,
        isPublished: true,
      },
      {
        id: uuidv7(),
        moduleId: mod1.id,
        title: "Ingredientes e suas funções",
        description: "Entenda o papel de cada ingrediente na receita.",
        durationSeconds: 720,
        position: 2,
        isPublished: true,
      },
    ]);

    // ------ Lessons (module 2) ------
    await db.insert(lessons).values([
      {
        id: uuidv7(),
        moduleId: mod2.id,
        title: "Ganache perfeita",
        description: "Técnica infalível para uma ganache cremosa.",
        durationSeconds: 900,
        position: 0,
        isPublished: true,
      },
      {
        id: uuidv7(),
        moduleId: mod2.id,
        title: "Decoração com manga",
        description: "Aprenda a trabalhar com manga de confeitar.",
        durationSeconds: 1200,
        position: 1,
        isPublished: true,
      },
    ]);

    console.log("  ✅  2 modules and 5 lessons created");
  }

  // ------ Enrollment for student ------
  console.log("\n🎓 Creating student enrollment...");

  const studentUserId = createdUsers["student"];

  const [existingEnrollment] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(eq(enrollments.userId, studentUserId))
    .limit(1);

  if (existingEnrollment) {
    console.log("  ⚠️  Enrollment already exists, skipping");
  } else {
    await db.insert(enrollments).values({
      id: uuidv7(),
      userId: studentUserId,
      courseId,
      status: "active",
    });
    console.log("  ✅  Student enrolled in sample course");
  }

  // ------ Summary ------
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Seed complete! Test accounts:\n");
  console.log("  Role     | Email               | Password");
  console.log("  ---------|---------------------|-------------");
  for (const u of SEED_USERS) {
    console.log(
      `  ${u.role.padEnd(8)} | ${u.email.padEnd(19)} | ${u.password}`,
    );
  }
  console.log("\n  Course slug: confeitaria-artesanal-do-zero");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await client.end();
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
