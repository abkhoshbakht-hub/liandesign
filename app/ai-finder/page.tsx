import type { Metadata } from "next";
import AiFinderClient from "./ai-finder-client";

export const metadata: Metadata = {
  title: "یابنده هوشمند سایت",
  description: "بگویید چه سایتی می‌خواهید تا ۳ پیشنهاد دقیق از کاتالوگ بگیرید",
};

export default function AiFinderPage() {
  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">یابنده هوشمند</span>
          <h1 className="text-4xl md:text-5xl font-lalezar text-gray-900 dark:text-white mb-4">کدام سایت به درد شما می‌خورد؟</h1>
          <p className="text-sm text-gray-500 dark:text-white/40">توضیح بدهید — از بین سایت‌های واقعی کاتالوگ پیشنهاد می‌دهیم</p>
        </div>
        <AiFinderClient />
      </div>
    </section>
  );
}
