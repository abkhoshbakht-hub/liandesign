"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { removeFromCart } from "@/lib/cart";

export default function RemoveButton({ websiteId }: { websiteId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    await removeFromCart(websiteId);
    router.refresh();
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      title="حذف از سبد"
      className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
    >
      <Trash2 size={14} />
    </button>
  );
}
