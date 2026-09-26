import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

try {
  const envPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".env");
  if (!process.env.DATABASE_URL && existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^\s*DATABASE_URL\s*=\s*(.+?)\s*$/);
      if (m) process.env.DATABASE_URL = m[1].replace(/^["']|["']$/g, "");
    }
  }
} catch {}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const email = "admin@liandesign.com";
const password = "admin123";
const name = "مدیر لیان دیزاین";

const existing = await db.user.findUnique({ where: { email } });
if (existing) {
  console.log("Admin already exists:", email);
  await db.$disconnect();
  process.exit(0);
}

const hashed = await bcrypt.hash(password, 12);
const user = await db.user.create({
  data: {
    email,
    name,
    passwordHash: hashed,
    role: "ADMIN",
  },
  select: { id: true, email: true, name: true, role: true },
});

console.log("Admin created:");
console.log(JSON.stringify(user, null, 2));
await db.$disconnect();
