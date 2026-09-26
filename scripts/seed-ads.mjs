// Seed ad placements + default pricing (Phase 1). Idempotent.
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

const placements = [
  { key: "homepage.hero", name: "هیروی صفحه اصلی", description: "بنر اصلی بالای صفحه خانه" },
  { key: "homepage.header", name: "هدر صفحه اصلی", description: "نوار بالای صفحه خانه" },
  { key: "homepage.sidebar", name: "سایدبار خانه", description: "ستون کناری صفحه خانه" },
  { key: "marketplace.top", name: "بالای مارکت‌پلیس", description: "بالای لیست سایت‌ها" },
  { key: "marketplace.native", name: "نیتیو مارکت‌پلیس", description: "کارت هم‌شکل لیست سایت‌ها" },
  { key: "category.top", name: "بالای دسته‌بندی", description: "بالای صفحه دسته‌بندی" },
  { key: "category.sidebar", name: "سایدبار دسته‌بندی", description: "ستون کناری دسته‌بندی" },
  { key: "website.detail.native", name: "نیتیو صفحه سایت", description: "داخل صفحه جزئیات سایت" },
  { key: "store.top", name: "بالای فروشگاه", description: "بالای لیست محصولات" },
  { key: "store.native", name: "نیتیو فروشگاه", description: "کارت هم‌شکل لیست محصولات" },
  { key: "mobile.sticky", name: "چسبان موبایل", description: "بنر چسبان پایین موبایل" },
  { key: "mobile.hero", name: "هیروی موبایل", description: "بنر بالای موبایل" },
  { key: "footer", name: "فوتر", description: "ناحیه پاصفحه" },
];

const rules = [
  { key: "base_cpm", label: "CPM پایه (تومان / ۱۰۰۰ نمایش)", value: 45000 },
  { key: "base_cpc", label: "CPC پایه (تومان / کلیک)", value: 15000 },
  { key: "verification_threshold", label: "آستانه احراز هویت (تومان)", value: 10000000 },
];

const factors = [
  { key: "placement_homepage_hero", label: "ضریب هیروی خانه", factor: 3.0 },
  { key: "placement_marketplace_top", label: "ضریب بالای مارکت‌پلیس", factor: 2.0 },
  { key: "placement_category_top", label: "ضریب بالای دسته‌بندی", factor: 1.5 },
  { key: "placement_default", label: "ضریب پیش‌فرض", factor: 1.0 },
  { key: "device_mobile", label: "ضریب موبایل", factor: 1.2 },
  { key: "priority_boost", label: "ضریب اولویت", factor: 1.5 },
  { key: "exclusive", label: "ضریب انحصار", factor: 5.0 },
];

for (const p of placements) {
  await db.adPlacement.upsert({
    where: { key: p.key },
    create: p,
    update: { name: p.name, description: p.description },
  });
  console.log(`placement: ${p.key}`);
}
for (const r of rules) {
  await db.pricingRule.upsert({
    where: { key: r.key },
    create: r,
    update: { label: r.label, value: r.value },
  });
  console.log(`pricing rule: ${r.key} = ${r.value}`);
}
for (const f of factors) {
  await db.pricingFactor.upsert({
    where: { key: f.key },
    create: f,
    update: { label: f.label, factor: f.factor },
  });
  console.log(`pricing factor: ${f.key} = ${f.factor}`);
}
const now = new Date();
const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
const allPlacements = await db.adPlacement.findMany({ select: { id: true, key: true } });
for (const p of allPlacements) {
  await db.adInventory.upsert({
    where: { placementId_period: { placementId: p.id, period } },
    create: { placementId: p.id, period, capacity: 500000 },
    update: {},
  });
  console.log(`inventory: ${p.key} @ ${period} = 500000`);
}

const packages = [
  {
    name: "استارتر",
    slug: "starter",
    description: "نمایش + سایت اسپانسری — شروع دیده شدن",
    price: 5000000,
    items: [
      { placement: "marketplace.native", kind: "DISPLAY" },
      { placement: "marketplace.native", kind: "SPONSORED_WEBSITE" },
    ],
  },
  {
    name: "رشد",
    slug: "growth",
    description: "نمایش + جستجوی اسپانسری + سایت ویژه",
    price: 12000000,
    items: [
      { placement: "marketplace.native", kind: "DISPLAY" },
      { placement: "marketplace.native", kind: "SPONSORED_SEARCH" },
      { placement: "marketplace.top", kind: "FEATURED_WEBSITE" },
    ],
  },
  {
    name: "پریمیوم",
    slug: "premium",
    description: "هوم‌پیج + مارکت‌پلیس + دسته‌بندی",
    price: 25000000,
    items: [
      { placement: "homepage.hero", kind: "DISPLAY" },
      { placement: "marketplace.top", kind: "DISPLAY" },
      { placement: "category.top", kind: "CATEGORY_SPONSOR" },
    ],
  },
  {
    name: "برند",
    slug: "brand",
    description: "هوم‌پیج + دسته + نیتیو + محتوا",
    price: 45000000,
    items: [
      { placement: "homepage.hero", kind: "DISPLAY" },
      { placement: "category.top", kind: "CATEGORY_SPONSOR" },
      { placement: "marketplace.native", kind: "DISPLAY" },
      { placement: "website.detail.native", kind: "DISPLAY" },
    ],
  },
];

for (const p of packages) {
  await db.campaignPackage.upsert({
    where: { slug: p.slug },
    create: p,
    update: { name: p.name, description: p.description, price: p.price, items: p.items },
  });
  console.log(`package: ${p.slug}`);
}

const services = [
  { name: "طراحی بنر تبلیغاتی", slug: "banner-design", description: "بنر اختصاصی در ابعاد استاندارد", price: 2500000 },
  { name: "بنر پریمیوم", slug: "banner-premium", description: "بنر متحرک و چندسایزه", price: 5000000 },
  { name: "لندینگ‌پیج کمپین", slug: "landing-page", description: "صفحه فرود اختصاصی کمپین شما", price: 9000000 },
  { name: "مدیریت کمپین", slug: "campaign-management", description: "راه‌اندازی و بهینه‌سازی یک‌ماهه", price: 7000000 },
];

for (const s of services) {
  await db.advertisingService.upsert({
    where: { slug: s.slug },
    create: s,
    update: { name: s.name, description: s.description, price: s.price },
  });
  console.log(`service: ${s.slug}`);
}

for (const r of [
  { key: "credit_bonus_threshold", label: "آستانه بونوس کردیت (تومان)", value: 30000000 },
  { key: "credit_bonus_percent", label: "درصد بونوس کردیت", value: 10 },
  { key: "default_frequency_cap", label: "سقف پیش‌فرض نمایش روزانه", value: 3 },
]) {
  await db.pricingRule.upsert({
    where: { key: r.key },
    create: r,
    update: { label: r.label, value: r.value },
  });
  console.log(`pricing rule: ${r.key} = ${r.value}`);
}

await db.policyVersion.upsert({
  where: { version: "v1" },
  create: {
    version: "v1",
    title: "سیاست تبلیغات لیان دیزاین (پیش‌نویس)",
    body: "متن نهایی سیاست تبلیغات — پیش‌نویس فنی. قبل از فروش واقعی باید بازبینی و تکمیل شود.",
    active: true,
  },
  update: {},
});
console.log("policy: v1");

await db.$disconnect();
