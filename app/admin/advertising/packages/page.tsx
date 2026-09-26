import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatToman } from "@/lib/format";
import { listPackagesAdmin, createPackage, togglePackage } from "@/lib/data/ads-shop";
import InlineForm from "@/components/admin/InlineForm";
import PackageToggle from "@/components/admin/PackageToggle";

export default async function AdsPackages() {
  const packages = await listPackagesAdmin();

  async function addPackage(values: Record<string, string>) {
    "use server";
    const res = await createPackage({
      name: values.name,
      slug: values.slug,
      description: values.description,
      price: parseInt(values.price || "0", 10),
      itemsJson: values.items || "[]",
    });
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-white">پکیج‌ها ({packages.length.toLocaleString("fa-IR")})</div>
        <InlineForm
          label="پکیج جدید"
          fields={[
            { name: "name", placeholder: "نام" },
            { name: "slug", placeholder: "slug", dir: "ltr" },
            { name: "price", placeholder: "قیمت (تومان)", type: "number", dir: "ltr" },
            { name: "items", placeholder: 'آیتم‌ها JSON', dir: "ltr", required: false },
          ]}
          action={addPackage}
        />
      </div>
      <p className="text-[11px] text-white/30">فرمت آیتم‌ها: [{`{"placement":"marketplace.native","kind":"SPONSORED_WEBSITE"}`}]</p>
      <div className="space-y-3">
        {packages.map((p) => (
          <div key={p.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex-1">
              <div className="text-sm font-bold text-white">{p.name}</div>
              <div className="text-[11px] text-white/40 mt-1">
                <span className="font-jakarta" dir="ltr">{p.slug}</span> — <span className="font-jakarta">{formatToman(p.price)}</span>
              </div>
            </div>
            {!p.active && <Badge variant="gold">غیرفعال</Badge>}
            <PackageToggle id={p.id} active={p.active} />
          </div>
        ))}
      </div>
    </Card>
  );
}
