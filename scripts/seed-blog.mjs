// Seed initial blog content (from the old static page). Idempotent.
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

const cats = [
  { name: "آموزش", slug: "tutorials" },
  { name: "سئو", slug: "seo" },
];

for (const c of cats) {
  await db.blogCategory.upsert({ where: { slug: c.slug }, create: c, update: { name: c.name } });
  console.log(`blog category: ${c.slug}`);
}

const posts = [
  {
    title: "چرا طراحی سایت با Next.js بهتر از وردپرس است؟",
    slug: "nextjs-vs-wordpress",
    category: "tutorials",
    excerpt: "مقایسه کامل Next.js و وردپرس از نظر سرعت، امنیت و عملکرد...",
    body: "مقایسه کامل Next.js و وردپرس از نظر سرعت، امنیت و عملکرد.\n\nسایت‌های Next.js با رندر سمت سرور، سرعت بارگذاری بسیار بالاتری دارند و نمره PageSpeed بهتری می‌گیرند.\n\nاز نظر امنیت هم حذف لایه دیتابیس وردپرس و افزونه‌ها، سطح حمله را به حداقل می‌رساند.\n\nاگر سرعت و امنیت برایتان مهم است، Next.js انتخاب بهتری است.",
  },
  {
    title: "۱۰ نکته طلایی برای سئوی سایت",
    slug: "seo-tips",
    category: "seo",
    excerpt: "نکات مهم برای بهینه‌سازی سایت و کسب رتبه اول گوگل...",
    body: "نکات مهم برای بهینه‌سازی سایت و کسب رتبه اول گوگل.\n\n۱. سرعت بارگذاری را جدی بگیرید.\n۲. عنوان و توضیحات متا یکتا بنویسید.\n۳. ساختار هدینگ منظم داشته باشید.\n۴. تصاویر را فشرده و alt‌دار کنید.\n۵. نسخه موبایل بی‌نقص باشد.",
  },
  {
    title: "طراحی سایت فروشگاهی حرفه‌ای",
    slug: "pro-ecommerce",
    category: "tutorials",
    excerpt: "راهنمای کامل طراحی فروشگاه اینترنتی موفق...",
    body: "راهنمای کامل طراحی فروشگاه اینترنتی موفق.\n\nفروشگاه خوب یعنی: جستجوی سریع، تسویه کوتاه، درگاه امن و پیگیری سفارش شفاف.\n\nقبل از طراحی، محصولات و دسته‌بندی‌ها را مشخص کنید و برای موبایل اولویت قائل شوید.",
  },
];

for (const p of posts) {
  const category = await db.blogCategory.findUniqueOrThrow({ where: { slug: p.category } });
  await db.blogPost.upsert({
    where: { slug: p.slug },
    create: { title: p.title, slug: p.slug, excerpt: p.excerpt, body: p.body, categoryId: category.id, status: "PUBLISHED" },
    update: {},
  });
  console.log(`blog post: ${p.slug}`);
}

await db.$disconnect();
