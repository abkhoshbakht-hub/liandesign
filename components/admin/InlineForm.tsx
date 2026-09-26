"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

export default function InlineForm({
  label,
  fields,
  action,
}: {
  label: string;
  fields: { name: string; placeholder: string; type?: string; required?: boolean; dir?: string }[];
  action: (values: Record<string, string>) => Promise<{ ok: boolean; error?: string; id?: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await action(values);
    if (!res.ok) setError(res.error ?? "خطا");
    else {
      setValues({});
      setOpen(false);
      router.refresh();
    }
    setBusy(false);
  }

  if (!open) {
    return (
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        <Plus size={14} className="ml-1" />
        {label}
      </Button>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white">{label}</span>
        <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white">
          <X size={14} />
        </button>
      </div>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-2 items-end">
        {fields.map((f) => (
          <div key={f.name} className="space-y-1">
            <label className="text-[10px] text-white/30">{f.placeholder}</label>
            <Input
              value={values[f.name] ?? ""}
              onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
              placeholder={f.placeholder}
              type={f.type ?? "text"}
              required={f.required !== false}
              dir={f.dir}
              className="text-xs"
            />
          </div>
        ))}
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "..." : "ذخیره"}
        </Button>
      </form>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
