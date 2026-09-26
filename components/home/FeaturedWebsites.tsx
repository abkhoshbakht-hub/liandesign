import WebsiteCard from "@/components/website/WebsiteCard";
import { getWebsites } from "@/lib/data/websites";

export default async function FeaturedWebsites() {
  const websites = await getWebsites({ sort: "newest" }).then((all) => all.slice(0, 6));

  if (websites.length === 0) return null;

  return (
    <section className="py-20 bg-gray-100 dark:bg-obsidian-50 border-y border-gray-200 dark:border-white/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">منتخب لیان</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">سایت‌های منتخب</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((w) => (
            <WebsiteCard key={w.id} website={w} />
          ))}
        </div>
      </div>
    </section>
  );
}
