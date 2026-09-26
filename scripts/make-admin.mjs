// Promote a user to ADMIN: node scripts/make-admin.mjs user@example.com
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// minimal .env loader (no extra deps) so DATABASE_URL is available
try {
  const envPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".env");
  if (!process.env.DATABASE_URL && existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^\s*DATABASE_URL\s*=\s*(.+?)\s*$/);
      if (m) process.env.DATABASE_URL = m[1].replace(/^["']|["']$/g, "");
    }
  }
} catch { /* ignore */ }

const email = process.argv[2]?.toLowerCase().trim();
if (!email) {
  console.error("Usage: node scripts/make-admin.mjs user@example.com");
  process.exit(1);
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const user = await db.user.update({
  where: { email },
  data: { role: "ADMIN" },
  select: { email: true, role: true },
});
console.log(`OK: ${user.email} is now ${user.role}`);
await db.$disconnect();
