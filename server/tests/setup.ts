import "dotenv/config";

// Tests wipe the tickets table, so they must never point at the dev database.
const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl) {
  throw new Error("TEST_DATABASE_URL is not set; see README for test setup.");
}
if (testUrl === process.env.DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL must differ from DATABASE_URL.");
}

// src/lib/prisma.ts reads DATABASE_URL when first imported, which happens after this file runs.
process.env.DATABASE_URL = testUrl;
