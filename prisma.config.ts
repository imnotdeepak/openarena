import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });

// `prisma generate` (unlike migrate/db/studio) never opens a real connection,
// so it shouldn't hard-fail just because DATABASE_URL isn't set yet — that
// breaks `npm install`/`postinstall` in a fresh checkout or CI step before
// secrets are injected. The actual PrismaClient (lib/prisma.ts) still fails
// fast on a missing DATABASE_URL at real runtime.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
