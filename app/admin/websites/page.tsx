import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatToman } from "@/lib/format";
import { listWebsitesAdmin, deleteWebsite, updateWebsite } from "@/lib/data/admin";
import PublishToggle from "@/components/admin/PublishToggle";
import InlineForm from "@/components/admin/InlineForm";
import CrudItem from "@/components/admin/CrudItem";

export default async function AdminWebsites() {
  const websites = await listWebsitesAdmin();

  async function addSite(values: Record<string, string>) {
    "use server";
    const { createWebsite } = await import("@/lib/data/admin");
    return createWebsite({
      name: values.name,
      slug: values.slug,
      description: values.description,
      basePrice: parseInt(values.basePrice || "0", 10),
      categoryId: values.categoryId,
    });
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-white">سایت‌ها ({websites.length.toLocaleString("fa-IR")})</div>
        <InlineForm
          label="سایت جدید"
          fields={[
            { name: "name", placeholder: "نام سایت" },
            { name: "slug", placeholder: "slug", dir: "ltr" },
            { name: "basePrice", placeholder: "قیمت (تومان)", type: "number", dir: "ltr" },
            { name: "categoryId", placeholder: "ID دسته‌بندی" },
          ]}
          action={addSite}
        />
      </div>
      <div className="space-y-3">
        {websites.map((w) => (
          <CrudItem
            key={w.id}
            editFields={[
              { name: "name", placeholder: "نام" },
              { name: "slug", placeholder: "slug", dir: "ltr" },
              { name: "basePrice", placeholder: "قیمت", type: "number", dir: "ltr" },
            ]}
            onEdit={async (values) => {
              "use server";
              const data: Record<string, string | number> = {};
              if (values.name) data.name = values.name;
              if (values.slug) data.slug = values.slug;
              if (values.basePrice) data.basePrice = parseInt(values.basePrice, 10);
              const res = await updateWebsite(w.id, data as any);
              return res;
            }}
            onDelete={async () => {
              "use server";
              return deleteWebsite(w.id);
            }}
          >
            <div className="text-sm font-bold text-white">{w.name}</div>
            <div className="text-[11px] text-white/40 mt-1">
              {w.category.name} — {w._count.packages.toLocaleString("fa-IR")} پکیج —{" "}
              <span className="font-jakarta">{formatToman(w.basePrice)}</span>
            </div>
          </CrudItem>
        ))}
        {websites.length === 0 && <p className="text-xs text-white/30 text-center py-6">سایتی نیست.</p>}
      </div>
    </Card>
  );
}
