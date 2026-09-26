import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { setTestActor } from "../lib/test-actor";
import { allocateInventory } from "../lib/data/ads-engine";

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

const admin = await db.user.findUniqueOrThrow({ where: { email: "admin@liandesign.com" } });
setTestActor({ id: admin.id, role: "ADMIN" });
const period = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
const placement = await db.adPlacement.findUniqueOrThrow({ where: { key: "homepage.hero" } });
const camp = await db.campaign.findFirstOrThrow({ where: { title: "GUARD-ALLOC" } }).catch(() => null);
console.log("camp exists:", !!camp);
const res = await allocateInventory("dummy", placement.id, period, 10);
console.log("result:", JSON.stringify(res));
await db.$disconnect();
