import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // CLI commands (migrate, studio) use the direct connection; Neon's pooler
    // doesn't support the session features migrations rely on.
    url: process.env.DIRECT_URL,
  },
});
