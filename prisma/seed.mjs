// Phase 2 catalog seed — idempotent (safe to re-run).
// Prices come from the database (backend), never hard-coded in UI.
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const categories = [
  { name: "رستوران و کافه", slug: "restaurant", description: "سایت‌های رستوران، کافه و فست‌فود با منو و رزرو آنلاین" },
  { name: "شرکتی", slug: "corporate", description: "سایت‌های شرکتی مینیمال و حرفه‌ای" },
  { name: "فروشگاهی", slug: "shop", description: "فروشگاه‌های اینترنتی فوق‌سریع" },
  { name: "گردشگری و هتلینگ", slug: "tourism", description: "هتل، اقامتگاه و آژانس‌های گردشگری بوشهر" },
  { name: "پزشکی و کلینیک", slug: "clinic", description: "کلینیک‌ها، مطب‌ها و مراکز درمانی" },
  { name: "استارتاپی", slug: "saas", description: "لندینگ و پلتفرم‌های SaaS و استارتاپی" },
];

const websites = [
  {
    name: "رستوران مدرن",
    slug: "modern-restaurant",
    category: "restaurant",
    description: "سایت لوکس رستوران ایرانی با منوی آنلاین و رزرو میز",
    basePrice: 14900000,
    packages: [
      { name: "پایه", price: 14900000, features: ["صفحه اصلی", "منوی آنلاین", "فرم تماس", "ریسپانسیو"] },
      { name: "حرفه‌ای", price: 19900000, features: ["همه امکانات پایه", "رزرو آنلاین میز", "گالری تصاویر", "وبلاگ"] },
    ],
  },
  {
    name: "آریا کورپ",
    slug: "aria-corporate",
    category: "corporate",
    description: "سایت شرکتی مینیمال با معرفی خدمات و نمونه‌کارها",
    basePrice: 12000000,
    packages: [
      { name: "پایه", price: 12000000, features: ["صفحه اصلی", "درباره ما", "خدمات", "تماس"] },
      { name: "حرفه‌ای", price: 16500000, features: ["همه امکانات پایه", "نمونه‌کارها", "وبلاگ", "چندزبانه"] },
    ],
  },
  {
    name: "نوین شاپ",
    slug: "novin-shop",
    category: "shop",
    description: "فروشگاه اینترنتی فوق‌سریع با درگاه پرداخت",
    basePrice: 18000000,
    packages: [
      { name: "پایه", price: 18000000, features: ["کاتالوگ محصول", "سبد خرید", "درگاه پرداخت"] },
      { name: "حرفه‌ای", price: 24000000, features: ["همه امکانات پایه", "کد تخفیف", "گزارش فروش", "پنل مشتریان"] },
    ],
  },
  {
    name: "هتل ساحلی بوشهر",
    slug: "bushehr-hotel",
    category: "tourism",
    description: "سایت هتل و اقامتگاه با رزرو آنلاین اتاق",
    basePrice: 16000000,
    packages: [
      { name: "پایه", price: 16000000, features: ["معرفی هتل", "گالری", "فرم رزرو"] },
      { name: "حرفه‌ای", price: 21000000, features: ["همه امکانات پایه", "رزرو آنلاین", "نظرات مهمانان", "چندزبانه"] },
    ],
  },
  {
    name: "کلینیک پلاس",
    slug: "clinic-plus",
    category: "clinic",
    description: "سایت کلینیک و مطب با نوبت‌دهی آنلاین",
    basePrice: 15500000,
    packages: [
      { name: "پایه", price: 15500000, features: ["معرفی پزشکان", "خدمات", "فرم تماس"] },
      { name: "حرفه‌ای", price: 20500000, features: ["همه امکانات پایه", "نوبت‌دهی آنلاین", "مقالات سلامت", "گالری"] },
    ],
  },
  {
    name: "استارتاپ لانچ",
    slug: "saas-starter",
    category: "saas",
    description: "لندینگ مدرن استارتاپی با معرفی محصول و قیمت‌گذاری",
    basePrice: 13500000,
    packages: [
      { name: "پایه", price: 13500000, features: ["لندینگ تک‌صفحه", "معرفی ویژگی‌ها", "فرم عضویت"] },
      { name: "حرفه‌ای", price: 18500000, features: ["همه امکانات پایه", "صفحه قیمت‌گذاری", "وبلاگ", "سوالات متداول"] },
    ],
  },
];

const customizationOptions = [
  {
    key: "primaryColor",
    label: "رنگ اصلی",
    type: "COLOR",
    choices: [
      { value: "#00F5D4", label: "فیروزه‌ای", priceDelta: 0 },
      { value: "#0EA5E9", label: "آبی", priceDelta: 0 },
      { value: "#FFB703", label: "طلایی", priceDelta: 0 },
      { value: "#8B5CF6", label: "بنفش", priceDelta: 0 },
    ],
  },
  {
    key: "font",
    label: "فونت",
    type: "FONT",
    choices: [
      { value: "vazir", label: "وزیرمتن (پیش‌فرض)", priceDelta: 0 },
      { value: "brand", label: "فونت اختصاصی برند شما", priceDelta: 2000000 },
    ],
  },
  {
    key: "pages",
    label: "صفحات اضافه",
    type: "PAGE",
    choices: [
      { value: "blog", label: "وبلاگ", priceDelta: 3000000 },
      { value: "shop", label: "فروشگاه", priceDelta: 5000000 },
      { value: "gallery", label: "گالری تصاویر", priceDelta: 1500000 },
      { value: "booking", label: "رزرو آنلاین", priceDelta: 2500000 },
    ],
  },
  {
    key: "features",
    label: "امکانات اضافه",
    type: "FEATURE",
    choices: [
      { value: "payment", label: "درگاه پرداخت", priceDelta: 2000000 },
      { value: "lang-en", label: "نسخه انگلیسی", priceDelta: 4000000 },
      { value: "lang-ar", label: "نسخه عربی", priceDelta: 4000000 },
      { value: "chat", label: "چت آنلاین", priceDelta: 1500000 },
    ],
  },
];

const productCategories = [
  { name: "قالب آماده", slug: "template", description: "قالب‌های آماده وب‌سایت" },
  { name: "کیت رابط کاربری", slug: "ui-kit", description: "UI Kit و سیستم‌های طراحی" },
  { name: "فایل فیگما", slug: "figma", description: "فایل‌های طراحی Figma" },
  { name: "لندینگ‌پیج", slug: "landing", description: "لندینگ‌پیج‌های آماده" },
  { name: "کامپوننت و آیکون", slug: "assets", description: "کامپوننت، آیکون و دارایی‌های طراحی" },
  { name: "بویلرپلیت", slug: "boilerplate", description: "بویلرپلیت‌های توسعه" },
];

const products = [
  { name: "قالب فروشگاهی نوین", slug: "novin-template", category: "template", description: "قالب فروشگاهی واکنش‌گرا با Next.js", price: 4900000 },
  { name: "UI Kit داشبورد", slug: "dashboard-ui-kit", category: "ui-kit", description: "کیت رابط کاربری داشبورد مدیریتی", price: 1900000 },
  { name: "فایل Figma لندینگ رستوران", slug: "restaurant-figma", category: "figma", description: "طراحی کامل لندینگ رستوران در فیگما", price: 1500000 },
  { name: "لندینگ‌پیج SaaS", slug: "saas-landing", category: "landing", description: "لندینگ‌پیج مدرن معرفی محصول", price: 2900000 },
  { name: "پک آیکون خطی", slug: "line-icons", category: "assets", description: "۲۰۰ آیکون خطی تخصصی وب", price: 800000 },
  { name: "بویلرپلیت فروشگاهی Next.js", slug: "shop-boilerplate", category: "boilerplate", description: "شروع سریع پروژه فروشگاهی با احراز هویت و سبد", price: 3900000 },
];

async function main() {
  // Demo reviewer — locked account (random password nobody knows).
  const demoEmail = "demo@liandesign.ir";
  let demo = await db.user.findUnique({ where: { email: demoEmail } });
  if (!demo) {
    demo = await db.user.create({
      data: {
        name: "رضا محمدی",
        email: demoEmail,
        passwordHash: await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10),
        role: "CUSTOMER",
      },
    });
  }
  await db.review.deleteMany({ where: { userId: demo.id } });
  const r1 = await db.website.findUnique({ where: { slug: "novin-shop" } });
  const r2 = await db.website.findUnique({ where: { slug: "modern-restaurant" } });
  const p1 = await db.product.findUnique({ where: { slug: "novin-template" } });
  const seedReviews = [
    { websiteId: r1?.id ?? null, productId: null, rating: 5, comment: "طراحی سایت عالی بود. فروشم بعد از راه‌اندازی خیلی بهتر شد." },
    { websiteId: r2?.id ?? null, productId: null, rating: 5, comment: "رزرو آنلاین دقیقاً همونی شد که می‌خواستم. پشتیبانی هم عالیه." },
    { websiteId: null, productId: p1?.id ?? null, rating: 4, comment: "قالب تمیز و سریعی بود و با کمی شخصی‌سازی دقیق شد." },
  ].filter((r) => r.websiteId || r.productId);
  for (const r of seedReviews) {
    await db.review.create({
      data: { userId: demo.id, websiteId: r.websiteId, productId: r.productId, rating: r.rating, comment: r.comment, verified: true, status: "APPROVED" },
    });
  }
  console.log(`reviews: ${seedReviews.length} (approved demo reviews)`);

  for (const c of productCategories) {
    await db.productCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: c,
    });
  }
  console.log(`product categories: ${productCategories.length}`);

  for (const p of products) {
    const category = await db.productCategory.findUniqueOrThrow({ where: { slug: p.category } });
    await db.product.upsert({
      where: { slug: p.slug },
      update: { name: p.name, description: p.description, price: p.price, status: "PUBLISHED", categoryId: category.id },
      create: { name: p.name, slug: p.slug, description: p.description, price: p.price, status: "PUBLISHED", categoryId: category.id },
    });
    console.log(`product: ${p.slug}`);
  }

  // Ecosystem reference row — Doctor Site lives elsewhere; we only link out.
  await db.externalService.upsert({
    where: { key: "doctor-site" },
    update: {
      name: "Doctor Site",
      baseUrl: process.env.DOCTOR_SITE_URL ?? "https://doctorsite.example.com",
      active: true,
    },
    create: {
      key: "doctor-site",
      name: "Doctor Site",
      baseUrl: process.env.DOCTOR_SITE_URL ?? "https://doctorsite.example.com",
      active: true,
    },
  });
  console.log("external service: doctor-site");

  for (const o of customizationOptions) {
    await db.customizationOption.upsert({
      where: { key: o.key },
      update: { label: o.label, type: o.type, choices: o.choices, active: true },
      create: { key: o.key, label: o.label, type: o.type, choices: o.choices, active: true },
    });
  }
  console.log(`customization options: ${customizationOptions.length}`);

  for (const c of categories) {
    await db.websiteCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: c,
    });
  }
  console.log(`categories: ${categories.length}`);

  for (const w of websites) {
    const category = await db.websiteCategory.findUniqueOrThrow({ where: { slug: w.category } });
    const website = await db.website.upsert({
      where: { slug: w.slug },
      update: {
        name: w.name,
        description: w.description,
        basePrice: w.basePrice,
        status: "PUBLISHED",
        categoryId: category.id,
      },
      create: {
        name: w.name,
        slug: w.slug,
        description: w.description,
        basePrice: w.basePrice,
        status: "PUBLISHED",
        categoryId: category.id,
      },
    });
    await db.websitePackage.deleteMany({ where: { websiteId: website.id } });
    for (const p of w.packages) {
      await db.websitePackage.create({
        data: { name: p.name, price: p.price, features: p.features, websiteId: website.id },
      });
    }
    console.log(`website: ${w.slug} (+${w.packages.length} packages)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
