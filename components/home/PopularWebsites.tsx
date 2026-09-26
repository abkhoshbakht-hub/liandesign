import Link from "next/link";
import { ExternalLink } from "lucide-react";
import WebsiteCard from "@/components/website/WebsiteCard";
import { getWebsites } from "@/lib/data/websites";

export default async function PopularWebsites() {
  const websites = await getWebsites({ sort: "newest" }).then((all) => all.slice(0, 3));

  if (websites.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50 dark:bg-obsidian">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">پربازدیدترین‌ها</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">محبوب‌ترین سایت‌ها</h2>
          </div>
          <Link href="/websites" className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-cyan transition-colors">
            مشاهده همه
            <ExternalLink size={14} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {websites.map((w) => (
            <WebsiteCard key={w.id} website={w} />
          ))}
        </div>
      </div>
    </section>
  );
}
