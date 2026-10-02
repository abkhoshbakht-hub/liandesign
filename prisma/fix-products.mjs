import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const m = env.match(/^DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m);
if (!m) { console.error("DATABASE_URL not found"); process.exit(1); }

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: m[1] }) });

const LICENSE = "این قالب توسط لیان‌دیزاین طراحی شده است. خریدار مجاز به استفاده در پروژه شخصی و تجاری خود است. تغییر رنگ، متن، تصاویر و لوگو آزاد است. فروش مجدد قالب مجاز نیست.";

const products = [
  {
    slug: "corporate-onepage",
    name: "قالب شرکتی تک‌صفحه",
    description: "قالب HTML/CSS/JS شرکتی تک‌صفحه — بدون هیچ وابستگی خارجی، فونت فارسی محلی، ۸ بخش کامل، ریسپانسیو کامل و SEO حرفه‌ای. آماده نصب بدون build.",
    price: 9000000,
    brandingPrice: 4500000,
    demoUrl: "/previews/ariatech/index.html",
    images: ["/previews/thumbs/ariatech.png"],
    includes: [
      "index.html — فایل اصلی",
      "assets/css/style.css — استایل‌های کامل",
      "assets/js/main.js — انیمیشن و تعاملات",
      "assets/img/ — ۱۸ تصویر نمونه",
      "assets/fonts/ — فونت Vazirmatn محلی",
      "README.md — راهنمای نصب و شخصی‌سازی",
    ],
    license: LICENSE,
  },
  {
    slug: "portfolio-gallery",
    name: "قالب پورتفولیو و گالری",
    description: "قالب HTML/CSS/JS پورتفولیو با گالری ۳۷ تصویر، فیلتر زنده دسته‌بندی، لایت‌باکس با کیبورد و ۵ بخش حرفه‌ای — مناسب عکاسان، طراحان و معماران.",
    price: 9000000,
    brandingPrice: 4500000,
    demoUrl: "/previews/gallery-amir/index.html",
    images: ["/previews/thumbs/gallery-amir.png"],
    includes: [
      "index.html — فایل اصلی",
      "src/css/style.css — استایل‌های کامل",
      "src/js/main.js — منو، فیلتر، لایت‌باکس",
      "assets/img/ — ۳۷ تصویر نمونه در ۵ دسته",
      "assets/fonts/ — فونت Vazirmatn محلی",
      "assets/logo.png — لوگو",
      "README.md — راهنمای نصب و شخصی‌سازی",
    ],
    license: LICENSE,
  },
  {
    slug: "dashboard-ui-kit",
    name: "UI Kit داشبورد",
    description: "کیت رابط کاربری داشبورد شامل کامپوننت‌های آماده — به‌زودی منتشر می‌شود",
  },
  {
    slug: "restaurant-figma",
    name: "فایل Figma لندینگ رستوران",
    description: "فایل فیگما لندینگ رستوران — به‌زودی منتشر می‌شود",
  },
  {
    slug: "saas-landing",
    name: "لندینگ‌پیج SaaS",
    description: "لندینگ‌پیج آماده برای محصولات SaaS — به‌زودی منتشر می‌شود",
  },
  {
    slug: "line-icons",
    name: "پک آیکون خطی",
    description: "بسته ۲۰۰ آیکون خطی تخصصی وب — به‌زودی منتشر می‌شود",
  },
];

const catTemplate = await db.productCategory.findFirst({ where: { slug: "template" } });

for (const p of products) {
  await db.product.update({
    where: { slug: p.slug },
    data: {
      name: p.name,
      description: p.description,
      price: p.price,
      brandingPrice: p.brandingPrice ?? 0,
      demoUrl: p.demoUrl ?? null,
      images: p.images ?? [],
      includes: p.includes ?? [],
      license: p.license ?? null,
      fileUrl: null,
      status: "PUBLISHED",
      ...(catTemplate && p.slug === "corporate-onepage" ? { categoryId: catTemplate.id } : {}),
      ...(catTemplate && p.slug === "portfolio-gallery" ? { categoryId: catTemplate.id } : {}),
    },
  });
  console.log(`✓ ${p.name}`);
}

const all = await db.product.findMany({ select: { name: true, slug: true, price: true, status: true }, orderBy: { name: "asc" } });
console.log("\n--- final ---");
for (const p of all) console.log(`${p.name} | ${p.slug} | ${p.price} | ${p.status}`);

await db.$disconnect();