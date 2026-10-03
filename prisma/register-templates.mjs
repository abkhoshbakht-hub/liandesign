import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const m = env.match(/^DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m);
if (!m) { console.error("DATABASE_URL not found"); process.exit(1); }
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: m[1] }) });

const LICENSE =
  "این قالب توسط لیان‌دیزاین طراحی شده است. خریدار مجاز به استفاده در پروژه شخصی و تجاری خود است. " +
  "تغییر رنگ، متن، تصاویر و لوگو آزاد است. فروش مجدد قالب یا انتشار آن در مارکت‌پلیس‌ها و گیت‌هاب مجاز نیست. " +
  "فایل LICENSE.txt با نام خریدار تکمیل می‌شود و نباید حذف شود.";

const BRANDING = 4500000;

// The 4 old placeholder rows are reused as the 4 real templates.
const items = [
  {
    from: "dashboard-ui-kit",
    slug: "agency-landing",
    name: "قالب آژانس دیجیتال",
    price: 10500000,
    demoUrl: "/previews/creativo/index.html",
    images: ["/previews/thumbs/creativo.png"],
    description:
      "لندینگ آژانس دیجیتال با Next.js 15 و React 19 — حالت تیره و روشن، گالری نمونه‌کار، بخش نظرات مشتریان و فرم تماس. مناسب شرکت‌های خدماتی و آژانس‌های تبلیغاتی.",
    includes: [
      "src/app — مسیرها و صفحه‌ها",
      "src/components — کامپوننت‌های اختصاصی",
      "public — تصاویر و فونت",
      "package.json — وابستگی‌ها و اسکریپت‌ها",
      "next.config.ts · tailwind.config · tsconfig.json — پیکربندی",
      "README.md — راهنمای نصب و شخصی‌سازی",
      "LICENSE.txt — پروانه استفاده",
    ],
  },
  {
    from: "saas-landing",
    slug: "saas-landing",
    name: "قالب لندینگ نرم‌افزاری SaaS",
    price: 11000000,
    demoUrl: "/previews/platformyar/index.html",
    images: ["/previews/thumbs/platformyar.png"],
    description:
      "لندینگ محصول نرم‌افزاری با Next.js 15 و React 19 — کامپوننت‌های اختصاصی، فرم تماس و بخش تعرفه. مناسب ارائه محصول SaaS و استارتاپ.",
    includes: [
      "src/app — مسیرها و صفحه‌ها",
      "src/components — کامپوننت‌های اختصاصی",
      "public — تصاویر",
      "package.json — وابستگی‌ها و اسکریپت‌ها",
      "next.config.ts · tailwind.config · tsconfig.json — پیکربندی",
      "README.md — راهنمای نصب و شخصی‌سازی",
      "LICENSE.txt — پروانه استفاده",
    ],
  },
  {
    from: "restaurant-figma",
    slug: "ecommerce-store",
    name: "قالب فروشگاه اینترنتی",
    price: 14000000,
    demoUrl: "/previews/baamarket/index.html",
    images: ["/previews/thumbs/baamarket.png"],
    description:
      "فروشگاه اینترنتی کامل با React 19 و Vite — صفحه محصول با سبد خرید، صفحه سفارش‌ها و داده‌های نمونه آماده. مناسب فروشگاه‌های کالا و پوشاک.",
    includes: [
      "src/pages — صفحه‌های فروشگاه، محصول، سبد و سفارش",
      "src/components — کامپوننت‌های رابط کاربری",
      "src/context · src/hooks · src/utils — منطق وضعیت و کمکی‌ها",
      "src/data — داده‌های نمونه محصولات",
      "public — تصاویر محصولات",
      "package.json + package-lock.json — نصب قطعی وابستگی‌ها",
      "README.md — راهنمای نصب و شخصی‌سازی",
      "LICENSE.txt — پروانه استفاده",
    ],
  },
  {
    from: "line-icons",
    slug: "multilingual-agency",
    name: "قالب وب‌سایت چندزبانه آژانس",
    price: 10500000,
    demoUrl: "/previews/novasphere/index.html",
    images: ["/previews/thumbs/novasphere.png"],
    description:
      "وب‌سایت چندزبانه با React 19 و Vite — صفحات خدمات، نمونه‌کار، درباره ما و تماس، به‌همراه ساختار آماده ترجمه. مناسب شرکت‌های بین‌المللی.",
    includes: [
      "src/pages — صفحه‌های خدمات، نمونه‌کار، درباره ما و تماس",
      "src/locales — ساختار چندزبانه و فایل‌های ترجمه",
      "src/layouts · src/components — چیدمان و کامپوننت‌ها",
      "src/data · src/context — داده‌ها و وضعیت",
      "public — تصاویر",
      "package.json + package-lock.json — نصب قطعی وابستگی‌ها",
      "README.md — راهنمای نصب و شخصی‌سازی",
      "LICENSE.txt — پروانه استفاده",
    ],
  },
];

const cat = await db.productCategory.findFirst({ where: { slug: "template" } });
if (!cat) { console.error("template category not found"); process.exit(1); }

for (const it of items) {
  await db.product.update({
    where: { slug: it.from },
    data: {
      slug: it.slug,
      name: it.name,
      description: it.description,
      price: it.price,
      brandingPrice: BRANDING,
      demoUrl: it.demoUrl,
      images: it.images,
      includes: it.includes,
      license: LICENSE,
      fileUrl: null,
      categoryId: cat.id,
      status: "PUBLISHED",
    },
  });
  console.log(`OK  ${it.from} -> ${it.slug}  ${it.name}  ${it.price.toLocaleString("fa-IR")}`);
}

const all = await db.product.findMany({
  select: { slug: true, name: true, price: true, brandingPrice: true, demoUrl: true, images: true, includes: true, status: true },
  orderBy: { price: "asc" },
});

console.log("\n--- محصولات نهایی فروشگاه ---");
for (const p of all) {
  const ready = p.demoUrl || p.images.length > 0 || p.includes.length > 0;
  console.log(
    `${p.name.padEnd(30)} ${String(p.price).padStart(9)}  +${p.brandingPrice}  demo=${p.demoUrl ? "YES" : "img "}  img=${p.images.length}  inc=${p.includes.length}  ${ready ? "آماده" : "خالی"}  ${p.status}`
  );
}
console.log(`\ntotal products = ${all.length}`);
await db.$disconnect();