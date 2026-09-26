import { Card } from "@/components/ui/card";
import { formatToman } from "@/lib/format";
import { listInventory, setInventoryCapacity, listPlacements } from "@/lib/data/ads";
import InlineForm from "@/components/admin/InlineForm";

function currentPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function AdsInventory({
  searchParams,
}: {
  searchParams: { placement?: string };
}) {
  const [rows, placements] = await Promise.all([
    listInventory(searchParams.placement || undefined),
    listPlacements(),
  ]);

  async function setCapacity(values: Record<string, string>) {
    "use server";
    const res = await setInventoryCapacity({
      placementId: values.placementId.trim(),
      period: values.period.trim() || currentPeriod(),
      capacity: parseInt(values.capacity || "0", 10),
    });
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="text-sm font-bold text-white">ثبت ظرفیت ماهانه</div>
        <InlineForm
          label="ثبت ظرفیت"
          fields={[
            { name: "placementId", placeholder: "ID پلیسمنت (از لیست زیر)" },
            { name: "period", placeholder: `دوره (مثل ${currentPeriod()})`, dir: "ltr", required: false },
            { name: "capacity", placeholder: "ظرفیت (ایمپرشن)", type: "number", dir: "ltr" },
          ]}
          action={setCapacity}
        />
        <div className="text-[11px] text-white/30">ID پلیسمنت‌ها: {placements.map((p) => `${p.key}=${p.id.slice(0, 6)}…`).join("، ")}</div>
      </Card>
      <Card className="p-6">
        <div className="text-sm font-bold text-white mb-4">ظرفیت‌ها ({rows.length.toLocaleString("fa-IR")})</div>
        <div className="space-y-3">
          {rows.length === 0 && <p className="text-xs text-white/30">رکوردی نیست.</p>}
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex-1">
                <div className="text-sm font-bold text-white">{r.placement.name}</div>
                <div className="text-[11px] text-white/40 mt-1 font-jakarta" dir="ltr">{r.period}</div>
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white font-jakarta">
                  {r.allocated.toLocaleString("fa-IR")} / {r.capacity.toLocaleString("fa-IR")}
                </div>
                <div className="text-[10px] text-white/30">تخصیص / ظرفیت</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
