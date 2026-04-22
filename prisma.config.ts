import { config } from "dotenv";
import { defineConfig, env } from "@prisma/config";

config();

export default defineConfig({
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    // Prefer a non-pooled (direct) connection for Prisma schema/migrate commands.
    // Neon/pgBouncer pooled URLs can break migrations in some setups.
    url: process.env.DIRECT_URL ? env("DIRECT_URL") : env("DATABASE_URL"),
  },
});
