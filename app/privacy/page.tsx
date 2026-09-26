import type { Metadata } from "next";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "حریم خصوصی",
  description: "سیاست حریم خصوصی لیان دیزاین",
};

export default function PrivacyPage() {
  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-lalezar text-gray-900 dark:text-white mb-4">حریم خصوصی</h1>
        <p className="text-sm text-gray-500 dark:text-white/40 mb-10">آخرین به‌روزرسانی: شهریور ۱۴۰۵</p>
        <Card className="p-6 md:p-8 space-y-6 text-sm text-gray-600 dark:text-white/60 leading-loose">
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white mb-2">۱. چه داده‌ای جمع می‌کنیم</h2>
            <p>فقط داده‌های لازم برای ارائه خدمت: نام، ایمیل، تلفن (در صورت ارائه)، سفارش‌ها، تیکت‌های پشتیبانی و رویدادهای فنی ناشناس (مثل بازدید صفحات). اطلاعات حساس غیرضروری جمع‌آوری نمی‌شود.</p>
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white mb-2">۲. استفاده از داده‌ها</h2>
            <p>داده‌ها فقط برای پردازش سفارش، پشتیبانی، بهبود سایت و (با رضایت شما) اطلاع‌رسانی استفاده می‌شوند. اطلاعات خام کاربران هرگز در اختیار تبلیغ‌دهندگان قرار نمی‌گیرد.</p>
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white mb-2">۳. کوکی‌ها</h2>
            <p>از کوکی برای ورود به حساب، سبد خرید و attribution ارجاع (مثل کمپین ورودی) استفاده می‌کنیم. با ادامه استفاده از سایت، با این موارد موافقت می‌کنید.</p>
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white mb-2">۴. اشتراک‌گذاری</h2>
            <p>داده‌های شما فروخته نمی‌شود. فقط در حد ضرورت فنی (مثل درگاه پرداخت) و با رعایت امنیت به ارائه‌دهندگان خدمات منتقل می‌شود.</p>
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white mb-2">۵. حقوق شما</h2>
            <p>می‌توانید درخواست مشاهده، اصلاح یا حذف داده‌های خود را از طریق تیکت پشتیبانی ثبت کنید.</p>
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white mb-2">۶. تماس</h2>
            <p>سؤال درباره حریم خصوصی؟ از صفحه تماس یا تیکت پشتیبانی با ما در ارتباط باشید.</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
