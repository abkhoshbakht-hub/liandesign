import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import BriefForm from "@/components/custom-design/BriefForm";

export const metadata: Metadata = {
  title: "طراحی سایت اختصاصی",
  description: "طراحی و توسعه اختصاصی وب‌سایت برای کسب‌وکار شما — از ایده تا تحویل",
};

const SERVICES = ["طراحی اختصاصی UI", "توسعه با Next.js", "فروشگاه اینترنتی", "پنل مدیریت فارسی", "سئو تکنیکال پایه", "اتصال درگاه پرداخت"];
const PROCESS = [
  { t: "ثبت Brief", d: "فرم زیر را پر کنید تا نیازتان را دقیق بفهمیم" },
  { t: "پروپوزال", d: "زمان‌بندی و برآورد شفاف در تیکت دریافت می‌کنید" },
  { t: "طراحی و توسعه", d: "با بازبینی مرحله‌ای شما پیش می‌رویم" },
  { t: "تحویل و پشتیبانی", d: "تحویل نهایی + آموزش + پشتیبانی" },
];
const FAQS = [
  { q: "هزینه طراحی اختصاصی چقدر است؟", a: "بسته به صفحات و امکانات متفاوت است؛ بعد از Brief برآورد دقیق می‌دهیم." },
  { q: "چقدر طول می‌کشد؟", a: "معمولاً ۲ تا ۶ هفته بسته به حجم پروژه." },
  { q: "پشتیبانی دارد؟", a: "بله؛ پشتیبانی پس از تحویل طبق توافق ارائه می‌شود." },
];

export default async function CustomDesignPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/custom-design");

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">طراحی اختصاصی</span>
          <h1 className="text-4xl md:text-5xl font-lalezar text-gray-900 dark:text-white mb-4">سایتی که دقیقاً مال شماست</h1>
          <p className="text-sm text-gray-500 dark:text-white/40 max-w-xl mx-auto leading-relaxed">
            وقتی سایت آماده جواب نمی‌دهد، از صفر برایتان می‌سازیم — طراحی، توسعه، تحویل.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
          {SERVICES.map((s) => (
            <div key={s} className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/70 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3">
              <CheckCircle size={15} className="text-cyan shrink-0" />
              {s}
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">فرآیند کار</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {PROCESS.map((p, i) => (
            <Card key={p.t} className="p-5">
              <div className="w-8 h-8 rounded-full bg-cyan text-obsidian text-sm font-extrabold flex items-center justify-center mb-3">
                {(i + 1).toLocaleString("fa-IR")}
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">{p.t}</div>
              <div className="text-[11px] text-gray-500 dark:text-white/40 leading-relaxed">{p.d}</div>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">فرم درخواست (Brief)</h2>
        <div className="mb-12">
          <BriefForm />
        </div>

        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">سؤالات پرتکرار</h2>
        <div className="space-y-3 mb-12">
          {FAQS.map((f) => (
            <Card key={f.q} className="p-5">
              <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">{f.q}</div>
              <div className="text-xs text-gray-500 dark:text-white/50 leading-relaxed">{f.a}</div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/websites" className="inline-flex items-center gap-2 text-sm text-cyan hover:underline">
            یا اول سایت‌های آماده را ببینید
            <ArrowLeft size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
