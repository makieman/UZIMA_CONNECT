// scripts/init-db.ts
import { execSync } from "child_process";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/prisma/seed";

async function initializeDatabase() {
  console.log("Initializing database...");

  try {
    // 1. Sync schema (creates/updates tables)
    console.log("→ Pushing Prisma schema to database...");
    execSync("npx prisma db push --skip-generate", { stdio: "inherit" });

    // 2. Generate Prisma Client (types)
    console.log("→ Generating Prisma Client...");
    execSync("npx prisma generate", { stdio: "inherit" });

    // 3. Seed initial data (admins, sample physicians, etc.)
    console.log("→ Seeding initial data...");
    await seedDatabase();

    console.log("Database initialization complete ✅");
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run only in development or when explicitly called
if (process.env.NODE_ENV === "development") {
  initializeDatabase();
}
