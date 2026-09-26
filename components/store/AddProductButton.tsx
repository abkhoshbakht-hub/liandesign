"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addProductToCart } from "@/lib/cart";

export default function AddProductButton({ productId }: { productId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "added" | "error">("idle");

  async function onClick() {
    setState("loading");
    const res = await addProductToCart(productId);
    setState(res.ok ? "added" : "error");
  }

  if (state === "added") {
    return (
      <Button asChild size="sm" variant="gold" className="w-full">
        <Link href="/checkout">
          <Check size={14} />
          به سبد اضافه شد — مشاهده سبد
        </Link>
      </Button>
    );
  }

  return (
    <div>
      <Button size="sm" className="w-full" disabled={state === "loading"} onClick={onClick}>
        <ShoppingCart size={14} />
        {state === "loading" ? "در حال افزودن..." : "افزودن به سبد"}
      </Button>
      {state === "error" && <p className="text-[11px] text-red-400 mt-2">خطایی رخ داد. دوباره تلاش کنید.</p>}
    </div>
  );
}
