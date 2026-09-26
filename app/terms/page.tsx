import type { Metadata } from "next";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "شرایط استفاده",
  description: "شرایط استفاده از خدمات لیان دیزاین",
};

export default function TermsPage() {
  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-lalezar text-gray-900 dark:text-white mb-4">شرایط استفاده</h1>
        <p className="text-sm text-gray-500 dark:text-white/40 mb-10">آخرین به‌روزرسانی: شهریور ۱۴۰۵</p>
        <Card className="p-6 md:p-8 space-y-6 text-sm text-gray-600 dark:text-white/60 leading-loose">
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white mb-2">۱. خدمات</h2>
            <p>لیان دیزاین فروشگاه سایت‌های آماده، محصولات دیجیتال، طراحی اختصاصی و تبلیغات آنلاین است. مشخصات هر محصول در صفحه خودش اعلام می‌شود و ملاک عمل است.</p>
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white mb-2">۲. قیمت و پرداخت</h2>
            <p>همه قیمت‌ها به تومان و از Backend خوانده می‌شوند. پرداخت موفق به‌معنای شروع تحویل طبق شرایط اعلام‌شده هر محصول است.</p>
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white mb-2">۳. تحویل و پشتیبانی</h2>
            <p>زمان تحویل و سطح پشتیبانی هر محصول در صفحه آن مشخص است. برای طراحی اختصاصی، توافق در قالب Brief و تیکت ثبت و ملاک است.</p>
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white mb-2">۴. بازگشت وجه</h2>
            <p>درخواست بازگشت وجه از طریق تیکت بررسی می‌شود. محصولات دانلودی پس از دانلود، جز در موارد نقص فنی، مشمول بازگشت نیستند.</p>
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white mb-2">۵. تبلیغات</h2>
            <p>شرایط اختصاصی کمپین‌های تبلیغاتی در قرارداد تبلیغات (پذیرش اولیه + تأیید نهایی) مشخص می‌شود و بر این شرایط عمومی مقدم است.</p>
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white mb-2">۶. مسئولیت‌ها</h2>
            <p>کاربر مسئول صحت اطلاعات حساب و محتوای ارائه‌شده برای طراحی است. سوءاستفاده از خدمات موجب مسدودسازی حساب می‌شود.</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
