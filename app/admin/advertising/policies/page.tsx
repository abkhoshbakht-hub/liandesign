import { Card } from "@/components/ui/card";
import { listPoliciesAdmin, createPolicy, togglePolicy } from "@/lib/data/ads";
import InlineForm from "@/components/admin/InlineForm";
import PolicyToggle from "@/components/admin/PolicyToggle";

export default async function AdsPolicies() {
  const policies = await listPoliciesAdmin();

  async function addPolicy(values: Record<string, string>) {
    "use server";
    const res = await createPolicy({ version: values.version.trim(), title: values.title, body: values.body });
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="text-sm font-bold text-white">نسخه سیاست جدید</div>
        <InlineForm
          label="ثبت سیاست"
          fields={[
            { name: "version", placeholder: "نسخه (مثل v2)", dir: "ltr" },
            { name: "title", placeholder: "عنوان" },
            { name: "body", placeholder: "متن سیاست" },
          ]}
          action={addPolicy}
        />
      </Card>
      <Card className="p-6">
        <div className="text-sm font-bold text-white mb-4">سیاست‌ها ({policies.length.toLocaleString("fa-IR")})</div>
        <div className="space-y-3">
          {policies.map((p) => (
            <div key={p.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex-1">
                <div className="text-sm font-bold text-white">
                  {p.title} <span className="font-jakarta text-white/40" dir="ltr">{p.version}</span>
                </div>
                <div className="text-[11px] text-white/40 mt-1 line-clamp-2">{p.body}</div>
              </div>
              <PolicyToggle id={p.id} active={p.active} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
