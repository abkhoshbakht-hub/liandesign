import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CustomQuoteForm from "@/components/advertise/CustomQuoteForm";

export const metadata: Metadata = {
  title: "درخواست کمپین سفارشی",
  description: "برای بودجه‌های بزرگ، پروپوزال اختصاصی دریافت کنید",
};

export default async function CustomQuotePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/advertise/custom");

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-lalezar text-gray-900 dark:text-white mb-3">کمپین سفارشی</h1>
          <p className="text-sm text-gray-500 dark:text-white/40 max-w-lg mx-auto leading-relaxed">
            بودجه بزرگی دارید؟ نیازتان را بنویسید تا پروپوزال اختصاصی (ظرفیت، قیمت و پکیج سفارشی) ارائه کنیم.
          </p>
        </div>
        <CustomQuoteForm />
      </div>
    </section>
  );
}
