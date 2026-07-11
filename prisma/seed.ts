import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const passwordHash = await bcrypt.hash("Admin@123", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@society.com",
    },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@society.com",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // Create default overdue threshold
  await prisma.setting.upsert({
    where: {
      key: "OVERDUE_THRESHOLD_DAYS",
    },
    update: {},
    create: {
      key: "OVERDUE_THRESHOLD_DAYS",
      value: "7",
    },
  });

  console.log("✅ Default admin created.");
  console.log("Email    : admin@society.com");
  console.log("Password : Admin@123");

  console.log("✅ Default settings created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });