// E2E: creates a temporary ACTIVE sponsored campaign, checks rendering, cleans up.
// Run: node scripts/test-ads-e2e.mjs  (dev server must run on :3002)
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
const site = await db.website.findFirst({ where: { slug: "novin-shop", status: "PUBLISHED" } });
if (!site) throw new Error("novin-shop missing");

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
      title: "E2E-TEST-CAMPAIGN",
      status: "ACTIVE",
      pricingModel: "FIXED_IMPRESSIONS",
      budget: 1000000,
      items: {
        create: { placementId: "marketplace.native", kind: "SPONSORED_WEBSITE", websiteId: site.id },
      },
    },
  });
  campaignId = c.id;
  console.log("created test campaign");

  await new Promise((r) => setTimeout(r, 6000)); // let dev revalidate
  const res = await fetch("http://localhost:3002/websites");
  const html = await res.text();
  const hasLabel = html.includes("تبلیغاتی");
  const hasSite = html.includes(site.name);
  console.log(`websites page: label=${hasLabel} site=${hasSite}`);
  if (!hasLabel || !hasSite) throw new Error("sponsored rendering check failed");
  console.log("E2E PASS");
} finally {
  if (campaignId) await db.campaign.delete({ where: { id: campaignId } });
  const left = await db.campaign.count({ where: { title: "E2E-TEST-CAMPAIGN" } });
  console.log(`cleanup: remaining test campaigns = ${left}`);
  await db.$disconnect();
}
