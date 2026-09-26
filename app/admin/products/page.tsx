import { Card } from "@/components/ui/card";
import { formatToman } from "@/lib/format";
import { listProductsAdmin, deleteProduct, updateProduct } from "@/lib/data/admin";
import PublishToggle from "@/components/admin/PublishToggle";
import InlineForm from "@/components/admin/InlineForm";
import CrudItem from "@/components/admin/CrudItem";

export default async function AdminProducts() {
  const products = await listProductsAdmin();

  async function addProduct(values: Record<string, string>) {
    "use server";
    const { createProduct } = await import("@/lib/data/admin");
    return createProduct({
      name: values.name,
      slug: values.slug,
      description: values.description,
      price: parseInt(values.price || "0", 10),
      fileUrl: values.fileUrl,
      categoryId: values.categoryId,
    });
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-white">محصولات ({products.length.toLocaleString("fa-IR")})</div>
        <InlineForm
          label="محصول جدید"
          fields={[
            { name: "name", placeholder: "نام محصول" },
            { name: "slug", placeholder: "slug", dir: "ltr" },
            { name: "price", placeholder: "قیمت (تومان)", type: "number", dir: "ltr" },
            { name: "categoryId", placeholder: "ID دسته‌بندی" },
            { name: "fileUrl", placeholder: "لینک فایل (اختیاری)", dir: "ltr" },
          ]}
          action={addProduct}
        />
      </div>
      <div className="space-y-3">
        {products.map((p) => (
          <CrudItem
            key={p.id}
            editFields={[
              { name: "name", placeholder: "نام" },
              { name: "slug", placeholder: "slug", dir: "ltr" },
              { name: "price", placeholder: "قیمت", type: "number", dir: "ltr" },
            ]}
            onEdit={async (values) => {
              "use server";
              const data: Record<string, string | number> = {};
              if (values.name) data.name = values.name;
              if (values.slug) data.slug = values.slug;
              if (values.price) data.price = parseInt(values.price, 10);
              const res = await updateProduct(p.id, data as any);
              return res;
            }}
            onDelete={async () => {
              "use server";
              return deleteProduct(p.id);
            }}
          >
            <div className="text-sm font-bold text-white">{p.name}</div>
            <div className="text-[11px] text-white/40 mt-1">
              {p.category.name} — <span className="font-jakarta">{formatToman(p.price)}</span>
            </div>
          </CrudItem>
        ))}
        {products.length === 0 && <p className="text-xs text-white/30 text-center py-6">محصولی نیست.</p>}
      </div>
    </Card>
  );
}
