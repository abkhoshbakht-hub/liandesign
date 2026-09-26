import { Card } from "@/components/ui/card";
import { listPricingAdmin, setPricingRule, setPricingFactor } from "@/lib/data/ads";
import InlineForm from "@/components/admin/InlineForm";

export default async function AdsPricing() {
  const { rules, factors } = await listPricingAdmin();

  async function saveRule(values: Record<string, string>) {
    "use server";
    const res = await setPricingRule(values.key.trim(), parseInt(values.value || "0", 10));
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  }

  async function saveFactor(values: Record<string, string>) {
    "use server";
    const res = await setPricingFactor(values.key.trim(), parseFloat(values.factor || "1"));
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="text-sm font-bold text-white">قوانین قیمت (تومان)</div>
        <InlineForm
          label="ثبت/ویرایش قانون"
          fields={[
            { name: "key", placeholder: "کلید (مثل base_cpm)", dir: "ltr" },
            { name: "value", placeholder: "مبلغ", type: "number", dir: "ltr" },
          ]}
          action={saveRule}
        />
        <div className="space-y-2">
          {rules.map((r) => (
            <div key={r.id} className="flex justify-between text-sm bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
              <span className="text-white/60">{r.label} <span className="font-jakarta text-white/30" dir="ltr">{r.key}</span></span>
              <span className="text-white font-jakarta">{r.value.toLocaleString("fa-IR")}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-6 space-y-4">
        <div className="text-sm font-bold text-white">ضرایب قیمت</div>
        <InlineForm
          label="ثبت/ویرایش ضریب"
          fields={[
            { name: "key", placeholder: "کلید (مثل placement_homepage_hero)", dir: "ltr" },
            { name: "factor", placeholder: "ضریب (مثل 1.5)", type: "number", dir: "ltr" },
          ]}
          action={saveFactor}
        />
        <div className="space-y-2">
          {factors.map((f) => (
            <div key={f.id} className="flex justify-between text-sm bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
              <span className="text-white/60">{f.label} <span className="font-jakarta text-white/30" dir="ltr">{f.key}</span></span>
              <span className="text-white font-jakarta">{f.factor}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
