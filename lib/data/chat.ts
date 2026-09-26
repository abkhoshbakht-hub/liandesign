import { db } from "@/lib/db";

export interface ChatReply {
  text: string;
  links?: { label: string; href: string }[];
}

interface FAQItem {
  category: string;
  keywords: string[];
  reply: ChatReply;
}

// ── دانش‌نامه جامع لیان دیزاین ──
const FAQ: FAQItem[] = [
  // ── معرفی ──
  {
    category: "service",
    keywords: ["لیان دیزاین", "درباره", "معرفی", "تیم", "کی هستید", "چه کسی", "سابقه", "تجربه", "کجایید"],
    reply: {
      text: "لیان دیزاین یک تیم حرفه‌ای طراحی سایت در بوشهر است که با بیش از ۵ سال تجربه، به مشتریان سراسر ایران خدمت‌رسانی می‌کند.\n\nخدمات ما شامل:\n• طراحی سایت آماده و اختصاصی\n• فروشگاه اینترنتی\n• سئو و بهینه‌سازی\n• پشتیبانی و تبلیغات",
      links: [
        { label: "درباره ما", href: "/about" },
        { label: "خدمات ما", href: "/services" },
      ],
    },
  },
  // ── قیمت ──
  {
    category: "pricing",
    keywords: ["قیمت", "هزینه", "چقدر", "مبلغ", "ارزان", "گران", "بودجه", "پول", "پرداخت", " تومان", " ریال", "تخفیف"],
    reply: {
      text: "قیمت سایت‌های لیان دیزاین:\n\n🟢 سایت آماده: از ۵۰۰ هزار تومان\n🟡 طراحی اختصاصی: از ۲ میلیون تومان\n🔴 فروشگاه اینترنتی: از ۳ میلیون تومان\n\nامکان پرداخت اقساطی نیز وجود دارد.",
      links: [
        { label: "لیست قیمت‌ها", href: "/pricing" },
        { label: "مشاوره رایگان", href: "/custom-design" },
      ],
    },
  },
  // ── زمان تحویل ──
  {
    category: "delivery",
    keywords: ["زمان", "تحویل", "چه مدت", "مدت زمان", "سرعت", "عجله", "فوری", "سریع", "کی آماده", "چه وقت"],
    reply: {
      text: "زمان تحویل بستگی به نوع سفارش دارد:\n\n⚡ سایت آماده: بلافاصله\n🕐 سایت اختصاصی: ۷ تا ۱۴ روز کاری\n🕐 فروشگاه اینترنتی: ۱۰ تا ۲۱ روز کاری\n\nاگر عجله دارید، سایت‌های آماده بهترین انتخاب هستند.",
      links: [{ label: "مشاهده سایت‌های آماده", href: "/websites" }],
    },
  },
  // ── نحوه سفارش ──
  {
    category: "order",
    keywords: ["سفارش", "نحوه سفارش", "چطور سفارش", "خرید", "ثبت سفارش", "شروع", "چه کنم", "قدم اول"],
    reply: {
      text: "مراحل سفارش در لیان دیزاین:\n\n۱️⃣ سایت مورد نظر را انتخاب کنید\n۲️⃣ پکیج مناسب را انتخاب کنید\n۳️⃣ سفارش را ثبت کنید\n۴️⃣ پرداخت را انجام دهید\n۵️⃣ سایت شما فعال می‌شود!\n\nهمچنین می‌توانید از مشاوره رایگان استفاده کنید.",
      links: [
        { label: "مشاهده سایت‌ها", href: "/websites" },
        { label: "مشاوره رایگان", href: "/custom-design" },
      ],
    },
  },
  // ── خدمات ──
  {
    category: "services",
    keywords: ["خدمات", "چه کار", "چه خدمات", "توضیح", "انجام", "ارائه", "سریس", "سرویس"],
    reply: {
      text: "خدمات کامل لیان دیزاین:\n\n🌐 طراحی سایت آماده\n🛒 فروشگاه اینترنتی\n📊 سئو و بهینه‌سازی\n🎨 طراحی گرافیک و UI/UX\n🔧 پشتیبانی فنی\n📢 تبلیغات دیجیتال\n🔍 یابنده هوشمند سایت",
      links: [
        { label: "خدمات ما", href: "/services" },
        { label: "فروشگاه", href: "/store" },
      ],
    },
  },
  // ── سایت آماده ──
  {
    category: "ready",
    keywords: ["سایت آماده", "قالب", "تمپلیت", "template", "آماده", "پیش فرض", "از پیش"],
    reply: {
      text: "سایت‌های آماده لیان دیزاین:\n\n✅ قابل نگهداری فوری\n✅ قابلیت سفارشی‌سازی\n✅ طراحی حرفه‌ای و مدرن\n✅ سئو شده\n✅ واکنش‌گرا (موبایل فرندلی)\n\nبیش از ۱۰ سایت آماده در دسته‌بندی‌های مختلف موجود است.",
      links: [{ label: "مشاهده سایت‌های آماده", href: "/websites" }],
    },
  },
  // ── فروشگاه اینترنتی ──
  {
    category: "ecommerce",
    keywords: ["فروشگاه", "محصول", "فروش آنلاین", "ecommerce", "e-commerce", "آنلاین شاپ", "سبد خرید", "درگاه پرداخت", "پرداخت آنلاین"],
    reply: {
      text: "فروشگاه‌های اینترنتی لیان دیزاین:\n\n🛒 مدیریت محصولات (تصویر، قیمت، موجودی)\n💳 درگاه پرداخت آنلاین\n📦 مدیریت سفارشات و ارسال\n📊 گزارش فروش\n📱 نسخه موبایل\n🔍 جستجوی پیشرفته محصولات",
      links: [
        { label: "فروشگاه‌های آماده", href: "/store" },
        { label: "طراحی اختصاصی", href: "/custom-design" },
      ],
    },
  },
  // ── سئو ──
  {
    category: "seo",
    keywords: ["سئو", "seo", "بهینه", "گوگل", " ranked", "rank", "نمایش در گوگل", "اول گوگل", "ترافیک", "بازدید"],
    reply: {
      text: "خدمات سئو لیان دیزاین:\n\n🔍 سئوی فنی سایت\n📝 بهینه‌سازی محتوا\n📊 تحلیل رقبا\n📈 گزارش پیشرفت\n🎯 سئوی محلی ( Local SEO)\n\nتمام سایت‌های ما با اصول سئو طراحی شده‌اند.",
      links: [{ label: "خدمات سئو", href: "/services/seo" }],
    },
  },
  // ── طراحی اختصاصی ──
  {
    category: "custom",
    keywords: ["طراحی اختصاصی", "سفارشی", "اختصاصی", "custom", "بنا به سلیقه", "شخصی", "خودم"],
    reply: {
      text: "طراحی اختصاصی لیان دیزاین:\n\n🎨 طراحی مطابق سلیقه شما\n🛠️ امکانات سفارشی\n📱 واکنش‌گرا\n🚀 سریع و بهینه\n💡 مشاوره رایگان اولیه\n\nفرم طراحی اختصاصی را پر کنید تا مشاوران ما با شما تماس بگیرند.",
      links: [{ label: "سفارش طراحی اختصاصی", href: "/custom-design" }],
    },
  },
  // ── وردپرس ──
  {
    category: "wordpress",
    keywords: ["وردپرس", "wordpress", "wp", "پلاگین", "افزونه"],
    reply: {
      text: "خدمات وردپرس لیان دیزاین:\n\n🔧 نصب و راه‌اندازی وردپرس\n🎨 قالب‌های حرفه‌ای و سفارشی\n📦 افزونه‌های مورد نیاز\n🔒 امنیت و پشتیبانی\n\nهمچنین سایت‌های اختصاصی بدون وردپرس نیز طراحی می‌کنیم.",
      links: [{ label: "خدمات وردپرس", href: "/services/wordpress" }],
    },
  },
  // ── اپلیکیشن ──
  {
    category: "app",
    keywords: ["اپلیکیشن", "اپ", "app", "موبایل", "اندروید", "ios", "اپل", "نرم افزار"],
    reply: {
      text: "لیان دیزاین فعلاً تمرکز بر طراحی سایت دارد.\n\nاگر به اپلیکیشن نیاز دارید، می‌توانیم شما را راهنمایی کنیم.\n\nهمچنین سایت‌های ما واکنش‌گرا هستند و روی موبایل عالی نمایش داده می‌شوند.",
      links: [
        { label: "نمونه کارها", href: "/portfolio" },
        { label: "تماس با ما", href: "/contact" },
      ],
    },
  },
  // ── پشتیبانی ──
  {
    category: "support",
    keywords: ["پشتیبانی", "پشتیبان", "کمک", "مشکل", "خطا", "bug", "باگ", "خراب", "کار نمیکنه", "کار نمی‌کنه", "اختلال"],
    reply: {
      text: "پشتیبانی لیان دیزاین:\n\n📞 تماس تلفنی: ۰۹۹۳-۸۸۶-۶۳۳۱\n📧 ایمیل: ab.khoshbakht@gmail.com\n🎫 ثبت تیکت آنلاین\n💬 گفتگوی زنده (همین چت)\n\nپشتیبانی رایگان برای تمام سایت‌ها ارائه می‌شود.",
      links: [
        { label: "ثبت تیکت", href: "/dashboard/tickets/new" },
        { label: "تماس با ما", href: "/contact" },
      ],
    },
  },
  // ── پرداخت ──
  {
    category: "payment",
    keywords: ["پرداخت", "کارت", "بانک", "درگاه", "اقساط", "قسط", "(rate)", "转账"],
    reply: {
      text: "روش‌های پرداخت لیان دیزاین:\n\n💳 پرداخت آنلاین (درگاه بانکی)\n🏦 کارت به کارت\n📋 پرداخت اقساطی (برای سفارشات بالای ۲ میلیون)\n💰 کردیت تبلیغاتی\n\nتمام پرداخت‌ها امن و رمزنگاری شده هستند.",
      links: [{ label: "راهنمای پرداخت", href: "/pricing" }],
    },
  },
  // ── تبلیغات ──
  {
    category: "ads",
    keywords: ["تبلیغ", "تبلیغات", "تبلیغ کنم", "تبلیغاتی", "تبلیغات آنلاین", "تبلیغ در سایت", "اسپانسر", "بنر"],
    reply: {
      text: "تبلیغات در لیان دیزاین:\n\n📢 بنرهای تبلیغاتی در صفحات مختلف\n🎯 هدف‌گیری هوشمند مخاطب\n📊 گزارش دقیق کلیک و بازدید\n💰 قیمت‌های مناسب\n\nمی‌توانید کمپین تبلیغاتی خود را شروع کنید.",
      links: [
        { label: "شروع تبلیغات", href: "/advertise" },
        { label: "مشاوره تبلیغاتی", href: "/advertise/custom" },
      ],
    },
  },
  // ── یابنده هوشمند ──
  {
    category: "ai_finder",
    keywords: ["یابنده", "هوشمند", "ai", "پیشنهاد", "کدوم سایت", "انتخاب سایت", "پیدا کردن", "انتخاب"],
    reply: {
      text: "یابنده هوشمند لیان دیزاین!\n\n🔍 بر اساس نیاز شما بهترین سایت را پیشنهاد می‌دهد\n🎯 فقط کافیست نیازتان را توضیح دهید\n⚡ در عرض چند ثانیه نتیجه بگیرید\n\nهمین الان امتحان کنید!",
      links: [{ label: "یابنده هوشمند", href: "/ai-finder" }],
    },
  },
  // ── مقایسه ──
  {
    category: "compare",
    keywords: ["مقایسه", "تفاوت", "کدوم بهتر", "مقایسه کن", "comparsion"],
    reply: {
      text: "قابلیت مقایسه سایت‌ها در لیان دیزاین:\n\n📊 مقایسه قیمت و امکانات\n📋 مقایسه پکیج‌ها\n🎯 انتخاب بهترین گزینه\n\nمی‌توانید تا ۳ سایت را همزمان مقایسه کنید.",
      links: [{ label: "مقایسه سایت‌ها", href: "/compare" }],
    },
  },
  // ── سفارشی‌سازی ──
  {
    category: "customize",
    keywords: ["سفارشی", "تغییر رنگ", "تغییر لوگو", "تغییر فونت", "ویرایش", "سفارشی سازی", "customizer"],
    reply: {
      text: "قابلیت سفارشی‌سازی لیان دیزاین:\n\n🎨 تغییر رنگ‌ها\n📝 تغییر متن‌ها\n🖼️ تغییر تصاویر\n🔤 تغییر فونت\n\nمی‌توانید قبل از خرید، سایت را به سلیقه خود تغییر دهید!",
      links: [{ label: "سفارشی‌سازی", href: "/customize" }],
    },
  },
  // ── پورتفولیو / نمونه کار ──
  {
    category: "portfolio",
    keywords: ["نمونه کار", "پورتفولیو", "portfolio", "نمونه", "کارهای انجام شده", "سابقه کار"],
    reply: {
      text: "نمونه کارهای لیان دیزاین:\n\n📁 بیش از ۵۰ پروژه موفق\n🌐 در حوزه‌های مختلف\n⭐ رضایت ۹۸٪ مشتریان\n\nمی‌توانید نمونه کارها را مشاهده کنید.",
      links: [{ label: "نمونه کارها", href: "/portfolio" }],
    },
  },
  // ── تماس ──
  {
    category: "contact",
    keywords: ["تماس", "شماره", "تلفن", "آدرس", "ارتباط", "ایمیل", "ایمیل", "locat", "آدرس"],
    reply: {
      text: "اطلاعات تماس لیان دیزاین:\n\n📍 بوشهر، شهرک نیایش\n📞 ۰۹۹۳-۸۸۶-۶۳۳۱\n📧 ab.khoshbakht@gmail.com\n🌐 www.liandesign.ir\n\nساعات کاری: شنبه تا پنج‌شنبه، ۹ صبح تا ۶ عصر",
      links: [{ label: "تماس با ما", href: "/contact" }],
    },
  },
  // ── وبلاگ ──
  {
    category: "blog",
    keywords: ["وبلاگ", "blog", "مقالات", "مقاله", "آموزش", "اخبار", "محتوا"],
    reply: {
      text: "وبلاگ لیان دیزاین:\n\n📝 مقالات آموزشی طراحی سایت\n📊 نکات سئو و بهینه‌سازی\n💡 اخبار دنیای وب\n🎨 الهام‌بخشی طراحی\n\nهر هفته مقالات جدید منتشر می‌شود.",
      links: [{ label: "وبلاگ", href: "/blog" }],
    },
  },
  // ── گارانتی ──
  {
    category: "warranty",
    keywords: ["گارانتی", "warranty", "ضمانت", "بازگشت پول", "بازگشت وجه", "استرداد", "رجوع"],
    reply: {
      text: "گارانتی لیان دیزاین:\n\n✅ ۷ روز گارانتی بازگشت پول\n✅ پشتیبانی رایگان\n✅ بروزرسانی رایگان\n✅ آموزش رایگان\n\nما کیفیت کارمان را تضمین می‌کنیم.",
      links: [{ label: "شرایط گارانتی", href: "/terms" }],
    },
  },
  // ── لوگو ──
  {
    category: "logo",
    keywords: ["لوگو", "logo", "آرم", "نشان", "برندینگ", "branding", "هویت بصری"],
    reply: {
      text: "طراحی لوگو در لیان دیزاین:\n\n🎨 طراحی حرفه‌ای و خلاقانه\n📐 فایل‌های با کیفیت بالا\n📦 شامل فایل‌های PNG, SVG, PDF\n🎯 مطابق هویت برند شما\n\nلوگوی شما اولین چیزی است که مخاطب می‌بیند!",
      links: [{ label: "طراحی گرافیک", href: "/services" }],
    },
  },
  // ── امنیت ──
  {
    category: "security",
    keywords: ["امنیت", "ssl", "گواهی", "امن", "محافظت", "هک", "حمله", "ویروس"],
    reply: {
      text: "امنیت سایت‌های لیان دیزاین:\n\n🔒 گواهی SSL رایگان\n🛡️ محافظت در برابر حملات\n🔄 بکاپ منظم\n🛡️ فایروال\n📊 مانیتورинг ۲۴ ساعته\n\nامنیت سایت شما برای ما در اولویت است.",
      links: [{ label: "امنیت سایت", href: "/services" }],
    },
  },
  // ── سرعت ──
  {
    category: "speed",
    keywords: ["سرعت", "speed", "کند", "سریع", "lighthouse", "پرفورمنس", "عملکرد", "بارگذاری"],
    reply: {
      text: "سرعت سایت‌های لیان دیزاین:\n\n⚡ بارگذاری کمتر از ۳ ثانیه\n📊 امتیاز Lighthouse بالای ۹۰\n🖼️ بهینه‌سازی تصاویر\n📦 فشرده‌سازی کدها\n🌐 CDN جهانی\n\nسرعت بالا = رضایت بیشتر کاربران!",
      links: [{ label: "نمونه کارها", href: "/portfolio" }],
    },
  },
  // ── دامنه ──
  {
    category: "domain",
    keywords: ["دامنه", "domain", "نام سایت", "آدرس سایت", "دامین", "هاست", "هاستینگ", "hosting", "سرور"],
    reply: {
      text: "خدمات دامنه و هاست لیان دیزاین:\n\n🌐 ثبت دامنه .ir و .com\n🖥️ هاست ایران و خارج\n💾 فضای کافی و پرسرعت\n🔄 انتقال دامنه\n\nهاست رایگان ۱ ساله با خرید سایت!",
      links: [{ label: "خدمات ما", href: "/services" }],
    },
  },
  // ── شبکه اجتماعی ──
  {
    category: "social",
    keywords: ["شبکه اجتماعی", "اینستاگرام", "تلگرام", "فیسبوک", "twitter", "توییتر", "یوتیوب", "آپارات"],
    reply: {
      text: "ما در شبکه‌های اجتماعی فعال هستیم!\n\n📱 اینستاگرام\n✈️ تلگرام\n📹 یوتیوب\n\nهمین الان ما را دنبال کنید!",
      links: [
        { label: "وبلاگ", href: "/blog" },
        { label: "تماس با ما", href: "/contact" },
      ],
    },
  },
  // ── سوالات فنی ──
  {
    category: "tech",
    keywords: ["html", "css", "javascript", "react", "next", "node", "php", "laravel", "python"],
    reply: {
      text: "تکنولوژی‌های مورد استفاده لیان دیزاین:\n\n⚛️ React & Next.js\n🎨 Tailwind CSS\n🗄️ PostgreSQL\n🔧 Prisma ORM\n\nما از مدرن‌ترین تکنولوژی‌ها استفاده می‌کنیم.",
      links: [{ label: "نمونه کارها", href: "/portfolio" }],
    },
  },
];

// ── تشخیص خارج از حوزه ──
const OUT_OF_SCOPE_PATTERNS = [
  /news|اخبار|سیاس|ورزش|فوتبال/,
  /weather|هوا|آب و هوا/,
  /recipe|آشپز|غذا|خوراک/,
  /movie|فیلم|سینما|serial|سریال/,
  /music|موسیقی|آهنگ/,
  /game|بازی|گیم/,
  /stock|بورس|سهام|دلار|ارز/,
  /medical|پزشک|دارو|بیمار/,
  /legal|قانون|قانونی|وکیل/,
  /school|مدرسه|دانشگاه|درس|امتحان/,
  /transport|اتوبوس|مترو|هواپیما|قطار/,
  /recipe|طرز تهیه/,
];

function isOutOfScope(input: string): boolean {
  const lower = input.toLowerCase();
  return OUT_OF_SCOPE_PATTERNS.some((p) => p.test(lower));
}

function matchFAQ(input: string): ChatReply | null {
  const lower = input.toLowerCase().trim();
  let bestMatch: FAQItem | null = null;
  let bestScore = 0;

  for (const item of FAQ) {
    let score = 0;
    for (const kw of item.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score += kw.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestMatch && bestScore > 0 ? bestMatch.reply : null;
}

function getWelcome(): ChatReply {
  return {
    text: "سلام! 👋\nمن دستیار هوشمند لیان دیزاین هستم.\n\nمی‌توانم در مورد:\n🌐 طراحی سایت\n🛒 فروشگاه اینترنتی\n📊 سئو و بهینه‌سازی\n💰 قیمت و پرداخت\n📋 نحوه سفارش\n\nسوال خود را بنویسید.",
    links: [
      { label: "مشاهده سایت‌ها", href: "/websites" },
      { label: "قیمت‌ها", href: "/pricing" },
      { label: "یابنده هوشمند", href: "/ai-finder" },
    ],
  };
}

function getOutOfScope(): ChatReply {
  return {
    text: "متأسفانه پاسخ این سوال خارج از حوزه فعالیت لیان دیزاین است.\n\nلیان دیزاین در حوزه‌های زیر فعالیت می‌کند:\n🌐 طراحی سایت\n🛒 فروشگاه اینترنتی\n📊 سئو و بهینه‌سازی\n🎨 طراحی گرافیک\n📢 تبلیغات دیجیتال\n\nآیا سوال دیگری در این حوزه‌ها دارید؟",
    links: [
      { label: "خدمات ما", href: "/services" },
      { label: "تماس با ما", href: "/contact" },
    ],
  };
}

function getFallback(): ChatReply {
  return {
    text: "متأسفانه پاسخ دقیقی برای سوال شما ندارم.\n\nمی‌توانید:\n📞 با ما تماس بگیرید: ۰۹۹۳-۸۸۶-۶۳۳۱\n🎫 تیکت پشتیبانی ثبت کنید\n💬 سوال خود را دقیق‌تر بنویسید",
    links: [
      { label: "ثبت تیکت", href: "/dashboard/tickets/new" },
      { label: "تماس با ما", href: "/contact" },
    ],
  };
}

export async function handleChat(
  sessionId: string,
  message: string
): Promise<ChatReply> {
  const lower = message.toLowerCase().trim();

  // save user message (best effort)
  try {
    await db.chatMessage.create({
      data: { sessionId, role: "user", content: message },
    });
  } catch { /* DB may not be available */ }

  // welcome
  const greetings = ["سلام", "سلامی", "درود", "hello", "hi", "hey", "slm", "salam", "خوش آمدید"];
  if (greetings.some((g) => lower.startsWith(g) || lower === g)) {
    const reply = getWelcome();
    try {
      await db.chatMessage.create({
        data: { sessionId, role: "bot", content: reply.text },
      });
    } catch {}
    return reply;
  }

  // out of scope detection
  if (isOutOfScope(lower)) {
    const reply = getOutOfScope();
    try {
      await db.chatMessage.create({
        data: { sessionId, role: "bot", content: reply.text },
      });
    } catch {}
    return reply;
  }

  // faq
  const faqReply = matchFAQ(message);
  if (faqReply) {
    try {
      await db.chatMessage.create({
        data: { sessionId, role: "bot", content: faqReply.text },
      });
    } catch {}
    return faqReply;
  }

  // fallback
  const fallback = getFallback();
  try {
    await db.chatMessage.create({
      data: { sessionId, role: "bot", content: fallback.text },
    });
  } catch {}
  return fallback;
}

export async function sendLiveMessage(
  sessionId: string,
  content: string,
  role: "user" | "admin"
) {
  return db.chatMessage.create({
    data: { sessionId, role, content },
  });
}

export async function getChatHistory(sessionId: string, limit = 50) {
  return db.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

export async function listActiveSessions() {
  const sessions = await db.chatMessage.groupBy({
    by: ["sessionId"],
    _count: { id: true },
    _max: { createdAt: true },
    orderBy: { _max: { createdAt: "desc" } },
    take: 50,
  });
  return sessions.map((s) => ({
    sessionId: s.sessionId,
    messageCount: s._count.id,
    lastActivity: s._max.createdAt,
  }));
}
