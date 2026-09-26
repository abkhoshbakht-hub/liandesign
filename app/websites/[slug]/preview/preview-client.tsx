"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Monitor, Tablet, Smartphone, ExternalLink, Share2, Stethoscope, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import DoctorLink from "@/components/analytics/DoctorLink";
import { cn } from "@/lib/utils";
import { doctorSiteAuditUrl } from "@/lib/config";

type Device = "desktop" | "tablet" | "mobile";

const widths: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

export default function PreviewClient({
  website,
}: {
  website: { id: string; name: string; slug: string; demoUrl: string | null };
}) {
  const [device, setDevice] = useState<Device>("desktop");
  const [shared, setShared] = useState(false);

  async function onShare() {
    const url = `${window.location.origin}/websites/${website.slug}/preview`;
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      setShared(false);
    }
  }

  return (
    <section className="pt-24 pb-12 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Link href={`/websites/${website.slug}`} className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-cyan transition-colors">
            <ArrowRight size={14} />
            {website.name}
          </Link>
          <div className="mr-auto flex items-center gap-2">
            {(
              [
                { id: "desktop", icon: Monitor, label: "دسکتاپ" },
                { id: "tablet", icon: Tablet, label: "تبلت" },
                { id: "mobile", icon: Smartphone, label: "موبایل" },
              ] as const
            ).map((d) => (
              <button
                key={d.id}
                onClick={() => setDevice(d.id)}
                title={d.label}
                className={cn(
                  "p-2.5 rounded-lg border transition-colors",
                  device === d.id
                    ? "bg-cyan/10 border-cyan/40 text-cyan"
                    : "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:border-gray-300 dark:hover:border-white/20"
                )}
              >
                <d.icon size={16} />
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto transition-all duration-300" style={{ maxWidth: widths[device] }}>
          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-obsidian-50">
            {website.demoUrl ? (
              <iframe src={website.demoUrl} title={`پیش‌نمایش ${website.name}`} className="w-full h-[70vh] bg-white" />
            ) : (
              <div className="h-[70vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
                <span className="text-5xl opacity-20">🌐</span>
                <p className="text-gray-900 dark:text-white font-bold">پیش‌نمایش زنده «{website.name}»</p>
                <p className="text-xs text-gray-500 dark:text-white/40 max-w-sm leading-relaxed">
                  آدرس دموی زنده این سایت هنوز در پنل مدیریت ثبت نشده است. ساختار نمایش دسکتاپ / تبلت / موبایل آماده است.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mt-8">
          {website.demoUrl && (
            <Button asChild variant="secondary">
              <a href={website.demoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} />
                باز کردن دمو
              </a>
            </Button>
          )}
          <Button variant="secondary" onClick={onShare}>
            <Share2 size={14} />
            {shared ? "کپی شد!" : "اشتراک‌گذاری"}
          </Button>
          <Button asChild variant="secondary">
            <DoctorLink href={doctorSiteAuditUrl({ websiteId: website.id })} eventProps={{ websiteId: website.id }}>
              <Stethoscope size={14} />
              تحلیل در دکتر سایت
            </DoctorLink>
          </Button>
          <Button asChild>
            <Link href={`/customize/${website.id}`}>
              <SlidersHorizontal size={14} />
              شخصی‌سازی و خرید
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
