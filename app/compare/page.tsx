import type { Metadata } from "next";
import Link from "next/link";
import { Eye, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatToman } from "@/lib/format";
import { logEvent } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "مقایسه سایت‌ها",
  description: "سایت‌های آماده را از نظر قیمت، پکیج و امکانات مقایسه کنید",
  robots: { index: false, follow: false },
};

const MAX = 3;

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { ids?: string };
}) {
  const ids = (searchParams.ids ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, MAX);
  const websites =
    ids.length > 0
      ? await db.website.findMany({
          where: { id: { in: ids }, status: "PUBLISHED" },
          include: { category: true, packages: { orderBy: { price: "asc" } } },
        })
      : [];

  if (websites.length > 0) {
    await logEvent("compare_add", { ids: websites.map((w) => w.id).join(",") });
  }

  const rows: { label: string; render: (w: (typeof websites)[number]) => React.ReactNode }[] = [
    { label: "دسته‌بندی", render: (w) => w.category.name },
    { label: "قیمت پایه", render: (w) => <span className="font-jakarta font-bold text-cyan">{formatToman(w.basePrice)}</span> },
    {
      label: "پکیج‌ها",
      render: (w) => (
        <ul className="space-y-1">
          {w.packages.map((p) => (
            <li key={p.id} className="text-[11px]">
              {p.name} — <span className="font-jakarta">{formatToman(p.price)}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: "تعداد امکانات",
      render: (w) => w.packages.reduce((s, p) => s + p.features.length, 0).toLocaleString("fa-IR"),
    },
  ];

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-lalezar text-gray-900 dark:text-white mb-4">مقایسه سایت‌ها</h1>
          <p className="text-sm text-gray-500 dark:text-white/40">
            حداکثر {MAX.toLocaleString("fa-IR")} سایت — از صفحه هر سایت «افزودن به مقایسه» را بزنید
          </p>
        </div>

        {websites.length === 0 ? (
          <Card className="p-12 text-center max-w-lg mx-auto">
            <p className="text-sm text-gray-500 dark:text-white/50 mb-4">سایتی برای مقایسه انتخاب نشده است.</p>
            <Link href="/websites" className="text-sm text-cyan hover:underline">
              رفتن به مارکت‌پلیس
            </Link>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid gap-4 min-w-[600px]" style={{ gridTemplateColumns: `120px repeat(${websites.length}, 1fr)` }}>
              <div />
              {websites.map((w) => (
                <Card key={w.id} className="p-4 text-center">
                  <div className="text-base font-bold text-gray-900 dark:text-white mb-1">{w.name}</div>
                  <div className="flex justify-center gap-2 mt-3">
                    <Link href={`/websites/${w.slug}`} className="inline-flex items-center gap-1 text-[11px] text-cyan hover:underline">
                      <Eye size={12} />
                      مشاهده
                    </Link>
                    <Link href={`/websites/${w.slug}/preview`} className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-white/50 hover:text-cyan transition-colors">
                      <SlidersHorizontal size={12} />
                      دمو
                    </Link>
                  </div>
                </Card>
              ))}
              {rows.map((row) => (
                <>
                  <div key={`l-${row.label}`} className="text-xs font-bold text-gray-500 dark:text-white/40 py-3">
                    {row.label}
                  </div>
                  {websites.map((w) => (
                    <div key={`${w.id}-${row.label}`} className="text-xs text-gray-600 dark:text-white/70 py-3 border-t border-gray-200 dark:border-white/5">
                      {row.render(w)}
                    </div>
                  ))}
                </>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
