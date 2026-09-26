"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Check, X } from "lucide-react";

export default function CrudItem({
  children,
  onEdit,
  onDelete,
  editFields,
}: {
  children: React.ReactNode;
  onEdit: (values: Record<string, string>) => Promise<{ ok: boolean; error?: string }>;
  onDelete: () => Promise<{ ok: boolean; error?: string }>;
  editFields: { name: string; placeholder: string; type?: string; dir?: string }[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("مطمئنی حذف بشه؟")) return;
    setBusy(true);
    const res = await onDelete();
    if (!res.ok) setError(res.error ?? "خطا در حذف");
    else router.refresh();
    setBusy(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await onEdit(values);
    if (!res.ok) setError(res.error ?? "خطا");
    else {
      setEditing(false);
      router.refresh();
    }
    setBusy(false);
  }

  if (editing) {
    return (
      <div className="bg-white/5 border border-cyan/20 rounded-xl p-4 space-y-3">
        <form onSubmit={handleSave} className="flex flex-wrap gap-2 items-end">
          {editFields.map((f) => (
            <div key={f.name} className="space-y-1">
              <label className="text-[10px] text-white/30">{f.placeholder}</label>
              <input
                value={values[f.name] ?? ""}
                onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                placeholder={f.placeholder}
                type={f.type ?? "text"}
                dir={f.dir}
                className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan/40 w-36"
              />
            </div>
          ))}
          <button type="submit" disabled={busy} className="p-2 text-cyan hover:bg-cyan/10 rounded-lg disabled:opacity-50">
            <Check size={14} />
          </button>
          <button type="button" onClick={() => setEditing(false)} className="p-2 text-white/30 hover:text-white rounded-lg">
            <X size={14} />
          </button>
        </form>
        {error && <p className="text-[11px] text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4 group">
      <div className="flex-1">{children}</div>
      <button
        onClick={() => {
          setEditing(true);
          setError(null);
        }}
        className="p-2 text-white/30 hover:text-cyan opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
        disabled={busy}
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={handleDelete}
        className="p-2 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
        disabled={busy}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
