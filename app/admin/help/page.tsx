import { Card } from "@/components/ui/card";
import {
  LayoutDashboard, ShoppingBag, Globe, Package, FolderTree, Star, Percent, Ticket, Users,
  CheckCircle, ArrowLeft, Info,
} from "lucide-react";
import Link from "next/link";

const sections = [
  {
    icon: LayoutDashboard,
    title: "داشبورد",
    href: "/admin",
    color: "text-cyan",
    items: [
      "نمای کلی درآمد، کاربران، سایت‌ها و محصولات",
      "وضعیت سفارش‌ها بر اساس نوع (پرداخت شده، ناموفق و...)",
      "پرفروش‌ترین سایت‌ها",
    ],
  },
  {
    icon: ShoppingBag,
    title: "سفارش‌ها",
    href: "/admin/orders",
    color: "text-gold",
    items: [
      "لیست همه سفارش‌ها با شماره سفارش و نام کاربر",
      "تغییر وضعیت سفارش: پرداخت شده، ناموفق، لغو شده و...",
      "مشاهده جزئیات اقلام سفارش",
    ],
  },
  {
    icon: Globe,
    title: "سایت‌ها",
    href: "/admin/websites",
    color: "text-cyan",
    items: [
      "مشاهده لیست همه سایت‌های مارکت‌پلیس",
      "اضافه کردن سایت جدید (نام، slug، قیمت، دسته‌بندی)",
      "ویرایش اطلاعات سایت (روی آیتم هاور کنید و آیکون ویرایش رو بزنید)",
      "حذف سایت (روی آیتم هاور کنید و آیکون سطل زباله رو بزنید)",
      "تغییر وضعیت انتشار (منتشر / پیش‌نویس)",
    ],
  },
  {
    icon: Package,
    title: "محصولات",
    href: "/admin/products",
    color: "text-gold",
    items: [
      "مشاهده لیست محصولات دیجیتال (فایل‌ها و قالب‌ها)",
      "اضافه کردن محصول جدید با لینک دانلود",
      "ویرایش قیمت و اطلاعات محصول",
      "حذف محصول",
      "تغییر وضعیت انتشار",
    ],
  },
  {
    icon: FolderTree,
    title: "دسته‌بندی‌ها",
    href: "/admin/categories",
    color: "text-cyan",
    items: [
      "مدیریت دسته‌بندی سایت‌ها (مثلاً: فروشگاهی، شرکتی، رستوران)",
      "مدیریت دسته‌بندی محصولات (مثلاً: قالب، آیکون، UI Kit)",
      "اضافه، ویرایش و حذف دسته‌بندی‌ها",
      "مشاهده تعداد آیتم‌های هر دسته",
    ],
  },
  {
    icon: Star,
    title: "نظرات",
    href: "/admin/reviews",
    color: "text-gold",
    items: [
      "مشاهده نظرات در انتظار تأیید",
      "تأیید نظر (نمایش در سایت)",
      "رد نظر (عدم نمایش)",
      "مشاهده نظرات تأیید شده و رد شده",
    ],
  },
  {
    icon: Percent,
    title: "کوپن‌ها",
    href: "/admin/coupons",
    color: "text-cyan",
    items: [
      "ساخت کوپن تخفیف جدید (کد + درصد تخفیف)",
      "فعال / غیرفعال کردن کوپن",
      "حذف کوپن",
      "کوپن‌ها در صفحه تسویه حساب اعمال می‌شوند",
    ],
  },
  {
    icon: Ticket,
    title: "تیکت‌ها",
    href: "/admin/tickets",
    color: "text-gold",
    items: [
      "مشاهده تیکت‌های باز و بسته",
      "پاسخ به تیکت کاربران",
      "بستن تیکت",
      "مشاهده تاریخچه مکالمات",
    ],
  },
  {
    icon: Users,
    title: "کاربران",
    href: "/admin/users",
    color: "text-cyan",
    items: [
      "مشاهده لیست کاربران و تعداد سفارش‌های هرکدام",
      "تغییر نقش کاربر (مشتری ↔ مدیر)",
      "محافظت: نمی‌توانید نقش خودتان را تغییر دهید",
    ],
  },
];

export default function AdminHelp() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-lalezar text-white mb-2">راهنمای پنل مدیریت</h2>
        <p className="text-sm text-white/50">
          هر بخش از پنل مدیریت رو توضیح دادم. روی هر بخش کلیک کنید تا واردش بشید.
        </p>
      </div>

      <Card className="p-5 bg-cyan/5 border-cyan/20">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-cyan mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-bold text-white mb-1">نکته مهم</div>
            <p className="text-xs text-white/60 leading-relaxed">
              تمام قیمت‌ها به <span className="text-white font-bold">تومان</span> هستند.
              اطلاعات وارد شده در پنل مدیریت مستقیماً در سایت نمایش داده می‌شوند.
              قبل از انتشار، حتماً اطلاعات رو بررسی کنید.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="p-5 hover:border-cyan/30 transition-colors h-full">
              <div className="flex items-center gap-3 mb-4">
                <s.icon size={20} className={s.color} />
                <div className="text-base font-bold text-white">{s.title}</div>
                <ArrowLeft size={14} className="mr-auto text-white/30" />
              </div>
              <ul className="space-y-2">
                {s.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/60 leading-relaxed">
                    <CheckCircle size={12} className="text-cyan mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-5">
        <div className="text-sm font-bold text-white mb-4">نحوه اضافه کردن سایت جدید</div>
        <ol className="space-y-3 text-xs text-white/60 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="font-bold text-cyan">۱.</span>
            اول باید <span className="text-white font-bold">دسته‌بندی</span> داشته باشید. اگه ندارید، برید بخش دسته‌بندی‌ها و یکی بسازید.
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-cyan">۲.</span>
            برید بخش <span className="text-white font-bold">سایت‌ها</span> و دکمه «سایت جدید» رو بزنید.
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-cyan">۳.</span>
            نام سایت، slug (آدرس URL)، قیمت پایه و ID دسته‌بندی رو وارد کنید.
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-cyan">۴.</span>
            وضعیت انتشار رو از «پیش‌نویس» به «منتشر شده» تغییر بدید تا در سایت نمایش داده بشه.
          </li>
        </ol>
      </Card>

      <Card className="p-5">
        <div className="text-sm font-bold text-white mb-4">نحوه اضافه کردن محصول دیجیتال</div>
        <ol className="space-y-3 text-xs text-white/60 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="font-bold text-gold">۱.</span>
            <span className="text-white font-bold">دسته‌بندی محصول</span> بسازید (اگه ندارید).
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-gold">۲.</span>
            برید بخش <span className="text-white font-bold">محصولات</span> و دکمه «محصول جدید» رو بزنید.
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-gold">۳.</span>
            نام، slug، قیمت و لینک فایل دانلودی رو وارد کنید.
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-gold">۴.</span>
            وضعیت انتشار رو «منتشر شده» کنید.
          </li>
        </ol>
      </Card>
    </div>
  );
}
