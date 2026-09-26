import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatToman } from "@/lib/format";
import { listServicesAdmin, createService, toggleService } from "@/lib/data/ads-shop";
import InlineForm from "@/components/admin/InlineForm";
import ServiceToggle from "@/components/admin/ServiceToggle";

export default async function AdsServices() {
  const services = await listServicesAdmin();

  async function addService(values: Record<string, string>) {
    "use server";
    const res = await createService({
      name: values.name,
      slug: values.slug,
      description: values.description,
      price: parseInt(values.price || "0", 10),
    });
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-white">سرویس‌ها ({services.length.toLocaleString("fa-IR")})</div>
        <InlineForm
          label="سرویس جدید"
          fields={[
            { name: "name", placeholder: "نام" },
            { name: "slug", placeholder: "slug", dir: "ltr" },
            { name: "price", placeholder: "قیمت (تومان)", type: "number", dir: "ltr" },
            { name: "description", placeholder: "توضیح (اختیاری)", required: false },
          ]}
          action={addService}
        />
      </div>
      <div className="space-y-3">
        {services.map((s) => (
          <div key={s.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex-1">
              <div className="text-sm font-bold text-white">{s.name}</div>
              <div className="text-[11px] text-white/40 mt-1">
                <span className="font-jakarta" dir="ltr">{s.slug}</span> — <span className="font-jakarta">{formatToman(s.price)}</span>
              </div>
            </div>
            {!s.active && <Badge variant="gold">غیرفعال</Badge>}
            <ServiceToggle id={s.id} active={s.active} />
          </div>
        ))}
      </div>
    </Card>
  );
}
