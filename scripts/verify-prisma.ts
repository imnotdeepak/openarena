import { config } from "dotenv";

config({ path: ".env.local" });

const main = async (): Promise<void> => {
  const { prisma } = await import("../lib/prisma");
  await prisma.$queryRaw`SELECT 1`;
  console.log("✅ Connected");
  await prisma.$disconnect();
};

main().catch((error: unknown) => {
  console.error("❌ Connection failed:", error);
  process.exitCode = 1;
});
