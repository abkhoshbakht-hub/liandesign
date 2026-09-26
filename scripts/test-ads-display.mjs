// E2E: DISPLAY banner renders in homepage slot, then cleanup.
// Run: node scripts/test-ads-display.mjs (dev server on :3002)
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

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

const user = await db.user.findUnique({ where: { email: "admin@liandesign.com" } });
if (!user) throw new Error("admin user missing");

const profile = await db.advertiserProfile.upsert({
  where: { userId: user.id },
  create: { userId: user.id, company: "E2E-TEST" },
  update: {},
});

let campaignId = null;
try {
  const c = await db.campaign.create({
    data: {
      advertiserId: profile.id,
      title: "E2E-TEST-DISPLAY",
      status: "ACTIVE",
      pricingModel: "FIXED_IMPRESSIONS",
      budget: 1000000,
      items: {
        create: { placementId: "homepage.hero", kind: "DISPLAY" },
      },
      creatives: {
        create: {
          kind: "IMAGE",
          status: "APPROVED",
          fileUrl: "/images/liandesign.logo.png",
          linkUrl: "/websites",
        },
      },
    },
  });
  campaignId = c.id;
  console.log("created test display campaign");

  await new Promise((r) => setTimeout(r, 6000));
  const res = await fetch("http://localhost:3002/");
  const html = await res.text();
  const hasBanner = html.includes("/images/liandesign.logo.png") && html.includes("/api/ads/go?");
  console.log(`homepage slot renders banner: ${hasBanner}`);
  if (!hasBanner) throw new Error("display rendering check failed");
  console.log("E2E PASS");
} finally {
  if (campaignId) await db.campaign.delete({ where: { id: campaignId } });
  const left = await db.campaign.count({ where: { title: "E2E-TEST-DISPLAY" } });
  console.log(`cleanup: remaining = ${left}`);
  await db.$disconnect();
}
