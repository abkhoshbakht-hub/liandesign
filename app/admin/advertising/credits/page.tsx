import { Card } from "@/components/ui/card";
import { formatToman } from "@/lib/format";
import { listCreditsAdmin, grantCredit } from "@/lib/data/ads-shop";
import InlineForm from "@/components/admin/InlineForm";

export default async function AdsCredits() {
  const credits = await listCreditsAdmin();

  async function grant(values: Record<string, string>) {
    "use server";
    const res = await grantCredit({ userId: values.userId.trim(), amount: parseInt(values.amount || "0", 10) });
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="text-sm font-bold text-white">شارژ دستی کردیت</div>
        <InlineForm
          label="شارژ کردیت"
          fields={[
            { name: "userId", placeholder: "ID کاربر", dir: "ltr" },
            { name: "amount", placeholder: "مبلغ (تومان)", type: "number", dir: "ltr" },
          ]}
          action={grant}
        />
      </Card>
      <Card className="p-6">
        <div className="text-sm font-bold text-white mb-4">کردیت‌ها ({credits.length.toLocaleString("fa-IR")})</div>
        <div className="space-y-3">
          {credits.length === 0 && <p className="text-xs text-white/30">کردیتی نیست.</p>}
          {credits.map((c) => (
            <div key={c.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex-1">
                <div className="text-sm font-bold text-white font-jakarta">{formatToman(c.amount - c.used)}</div>
                <div className="text-[11px] text-white/40 mt-1">
                  {c.advertiser.company ?? "—"} — مصرف‌شده: <span className="font-jakarta">{formatToman(c.used)}</span>
                </div>
              </div>
              <span className="text-[10px] text-white/30 font-jakarta" dir="ltr">
                {c.expiresAt ? c.expiresAt.toISOString().slice(0, 10) : "∞"}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
