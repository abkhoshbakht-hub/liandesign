import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listPlacements } from "@/lib/data/ads";
import InlineForm from "@/components/admin/InlineForm";
import PlacementToggle from "@/components/admin/PlacementToggle";

export default async function AdsPlacements() {
  const placements = await listPlacements();

  async function addPlacement(values: Record<string, string>) {
    "use server";
    const { createPlacement } = await import("@/lib/data/ads");
    const res = await createPlacement({
      key: values.key.trim(),
      name: values.name,
      description: values.description,
    });
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-white">پلیسمنت‌ها ({placements.length.toLocaleString("fa-IR")})</div>
        <InlineForm
          label="پلیسمنت جدید"
          fields={[
            { name: "key", placeholder: "کلید (مثل homepage.hero)", dir: "ltr" },
            { name: "name", placeholder: "نام" },
            { name: "description", placeholder: "توضیح (اختیاری)", required: false },
          ]}
          action={addPlacement}
        />
      </div>
      <div className="space-y-3">
        {placements.map((p) => (
          <div key={p.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex-1">
              <div className="text-sm font-bold text-white">{p.name}</div>
              <div className="text-[11px] text-white/40 mt-1 font-jakarta" dir="ltr">{p.key}</div>
            </div>
            {p.exclusive && <Badge variant="gold">انحصاری</Badge>}
            <PlacementToggle id={p.id} active={p.active} />
          </div>
        ))}
      </div>
    </Card>
  );
}
