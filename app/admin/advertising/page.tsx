import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Megaphone, LayoutGrid, Boxes, Tags, Image, BarChart3, Gift, Wrench, Coins, FileText } from "lucide-react";
import { getAdsOverview } from "@/lib/data/ads-engine";

export default async function AdsHub() {
  const o = await getAdsOverview();

  const cards = [
    { label: "پلیسمنت‌ها", value: o.placements.toLocaleString("fa-IR") },
    { label: "رکورد ظرفیت", value: o.inventories.toLocaleString("fa-IR") },
    { label: "کمپین‌ها", value: o.campaigns.toLocaleString("fa-IR") },
    { label: "در انتظار بررسی", value: o.pending.toLocaleString("fa-IR") },
    { label: "بهره‌برداری ظرفیت", value: `${o.utilization.toLocaleString("fa-IR")}٪` },
  ];

  const links = [
    { href: "/admin/advertising/placements", label: "پلیسمنت‌ها", desc: "ساخت و فعال/غیرفعال", icon: LayoutGrid },
    { href: "/admin/advertising/inventory", label: "ظرفیت", desc: "تعیین ظرفیت ماهانه", icon: Boxes },
    { href: "/admin/advertising/pricing", label: "قیمت‌گذاری", desc: "قوانین و ضرایب", icon: Tags },
    { href: "/admin/advertising/revenue", label: "درآمد", desc: "ARPA / RPM / CTR", icon: BarChart3 },
    { href: "/admin/advertising/packages", label: "پکیج‌ها", desc: "STARTER تا BRAND", icon: Gift },
    { href: "/admin/advertising/services", label: "سرویس‌ها", desc: "بنر، لندینگ، مدیریت", icon: Wrench },
    { href: "/admin/advertising/credits", label: "کردیت‌ها", desc: "شارژ دستی و مانده", icon: Coins },
    { href: "/admin/advertising/policies", label: "سیاست‌ها", desc: "نسخه‌های حقوقی", icon: FileText },
    { href: "/admin/advertising/campaigns", label: "کمپین‌ها", desc: "بررسی، تأیید نهایی و وضعیت", icon: Megaphone },
    { href: "/admin/advertising/creatives", label: "کریتیوها", desc: "بازبینی و تأیید", icon: Image },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="text-lg font-bold text-white font-jakarta">{c.value}</div>
            <div className="text-[11px] text-white/40 mt-1">{c.label}</div>
          </Card>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="p-5 hover:border-cyan/30 transition-colors">
              <div className="flex items-center gap-3 mb-1">
                <l.icon size={18} className="text-cyan" />
                <div className="text-sm font-bold text-white">{l.label}</div>
              </div>
              <div className="text-[11px] text-white/40">{l.desc}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
