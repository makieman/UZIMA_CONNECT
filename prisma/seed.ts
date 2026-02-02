// prisma/seed.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@uzimacare.ke" },
    update: {},
    create: {
      email: "admin@uzimacare.ke",
      password: hashedPassword,
      fullName: "Admin User",
      role: "ADMIN",
      hospital: "UzimaCare HQ",
    },
  });

  await prisma.user.upsert({
    where: { email: "dr.owino@hospital.ke" },
    update: {},
    create: {
      email: "dr.owino@hospital.ke",
      password: hashedPassword,
      fullName: "Dr. John Owino",
      role: "PHYSICIAN",
      hospital: "Kenyatta National Hospital",
      licenseId: "A12345",
    },
  });

  console.log("Seed complete ✅");
}

// Optional: run directly when file is executed
if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
