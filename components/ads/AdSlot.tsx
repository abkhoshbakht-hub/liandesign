import { getDisplaySlot } from "@/lib/data/ads-engine";
import { logSponsoredViews } from "@/lib/data/ads-track";
import type { Viewer } from "@/lib/ads/viewer";

// اسلات بنر نمایشی (§57): ناهمگام، سبک، خالی = هیچ (صفر اثر روی UX)
// بدون viewer = چرخش عمومی (layout استاتیک می‌ماند)؛ با viewer = تارگتینگ کامل
export default async function AdSlot({
  placement,
  className = "",
  viewer,
}: {
  placement: string;
  className?: string;
  viewer?: Viewer;
}) {
  const viewerOrEmpty: Viewer = viewer ?? {};
  const slot = await getDisplaySlot(placement, viewerOrEmpty);
  if (!slot) return null;
  await logSponsoredViews([{ campaignId: slot.campaignId, placementKey: placement }]);

  const c = slot.creative;
  const href = `/api/ads/go?item=${slot.itemId}&to=${encodeURIComponent(c.linkUrl ?? "/")}`;

  return (
    <div className={`relative ${className}`}>
      <span className="absolute top-2 left-2 z-10 bg-white/10 text-white/50 text-[9px] px-2 py-0.5 rounded-full backdrop-blur">
        تبلیغات
      </span>
      <a href={href} className="block overflow-hidden rounded-2xl border border-white/10">
        {c.kind === "HTML" && c.html ? (
          <div dangerouslySetInnerHTML={{ __html: c.html }} />
        ) : c.fileUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.fileUrl} alt="تبلیغات" loading="lazy" className="w-full h-auto" />
        ) : null}
      </a>
    </div>
  );
}
