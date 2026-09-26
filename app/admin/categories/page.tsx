import { Card } from "@/components/ui/card";
import {
  listWebsiteCategories,
  createWebsiteCategory,
  updateWebsiteCategory,
  deleteWebsiteCategory,
  listProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
} from "@/lib/data/admin";
import InlineForm from "@/components/admin/InlineForm";
import CrudItem from "@/components/admin/CrudItem";

export default async function AdminCategories() {
  const [webCats, prodCats] = await Promise.all([listWebsiteCategories(), listProductCategories()]);

  async function addWebCat(values: Record<string, string>) {
    "use server";
    return createWebsiteCategory({ name: values.name, slug: values.slug, description: values.description });
  }
  async function addProdCat(values: Record<string, string>) {
    "use server";
    return createProductCategory({ name: values.name, slug: values.slug, description: values.description });
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-white">دسته‌بندی سایت‌ها ({webCats.length})</div>
          <InlineForm
            label="دسته جدید"
            fields={[
              { name: "name", placeholder: "نام" },
              { name: "slug", placeholder: "slug", dir: "ltr" },
              { name: "description", placeholder: "توضیحات (اختیاری)" },
            ]}
            action={addWebCat}
          />
        </div>
        <div className="space-y-3">
          {webCats.map((c) => (
            <CrudItem
              key={c.id}
              editFields={[
                { name: "name", placeholder: "نام" },
                { name: "slug", placeholder: "slug", dir: "ltr" },
              ]}
              onEdit={async (values) => {
                "use server";
                const data: Record<string, string> = {};
                if (values.name) data.name = values.name;
                if (values.slug) data.slug = values.slug;
                return updateWebsiteCategory(c.id, data);
              }}
              onDelete={async () => {
                "use server";
                return deleteWebsiteCategory(c.id);
              }}
            >
              <div className="text-sm font-bold text-white">{c.name}</div>
              <div className="text-[11px] text-white/40 mt-1">
                {c.slug} — {c._count.websites.toLocaleString("fa-IR")} سایت
              </div>
            </CrudItem>
          ))}
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-white">دسته‌بندی محصولات ({prodCats.length})</div>
          <InlineForm
            label="دسته جدید"
            fields={[
              { name: "name", placeholder: "نام" },
              { name: "slug", placeholder: "slug", dir: "ltr" },
              { name: "description", placeholder: "توضیحات (اختیاری)" },
            ]}
            action={addProdCat}
          />
        </div>
        <div className="space-y-3">
          {prodCats.map((c) => (
            <CrudItem
              key={c.id}
              editFields={[
                { name: "name", placeholder: "نام" },
                { name: "slug", placeholder: "slug", dir: "ltr" },
              ]}
              onEdit={async (values) => {
                "use server";
                const data: Record<string, string> = {};
                if (values.name) data.name = values.name;
                if (values.slug) data.slug = values.slug;
                return updateProductCategory(c.id, data);
              }}
              onDelete={async () => {
                "use server";
                return deleteProductCategory(c.id);
              }}
            >
              <div className="text-sm font-bold text-white">{c.name}</div>
              <div className="text-[11px] text-white/40 mt-1">
                {c.slug} — {c._count.products.toLocaleString("fa-IR")} محصول
              </div>
            </CrudItem>
          ))}
        </div>
      </Card>
    </div>
  );
}
