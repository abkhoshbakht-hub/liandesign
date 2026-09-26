"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { moderateReview } from "@/lib/data/admin";

export default function ReviewModerate({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick(status: "APPROVED" | "REJECTED") {
    setBusy(true);
    await moderateReview(id, status);
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => onClick("APPROVED")}
        disabled={busy}
        title="تأیید"
        className="p-2 rounded-lg text-cyan hover:bg-cyan/10 transition-colors disabled:opacity-50"
      >
        <Check size={14} />
      </button>
      <button
        onClick={() => onClick("REJECTED")}
        disabled={busy}
        title="رد"
        className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
      >
        <X size={14} />
      </button>
    </div>
  );
}
