"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  sanitizeValues,
  computeDelta,
  type CustomValues,
  type CustomizationOptionDTO,
} from "@/lib/customizer-utils";
import { logEvent } from "@/lib/analytics";

export type CartItem = {
  kind: "website" | "product";
  websiteId?: string;
  websiteSlug?: string;
  websiteName?: string;
  productId?: string;
  productSlug?: string;
  productName?: string;
  packageName: string;
  price: number; // تومان — موقع ثبت سفارش دوباره از دیتابیس چک می‌شود
  customization?: CustomValues | null;
};

const COOKIE_NAME = "lian-cart";
const MAX_AGE = 60 * 60 * 24 * 30; // ۳۰ روز

function normalize(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const out: CartItem[] = [];
  for (const r of raw) {
    if (typeof r !== "object" || r === null) continue;
    const o = r as Record<string, unknown>;
    if (typeof o.price !== "number") continue;
    if (typeof o.productId === "string") {
      if (typeof o.productSlug !== "string" || typeof o.productName !== "string") continue;
      out.push({
        kind: "product",
        productId: o.productId,
        productSlug: o.productSlug,
        productName: o.productName,
        packageName: typeof o.packageName === "string" ? o.packageName : "تکی",
        price: o.price,
      });
    } else if (typeof o.websiteId === "string") {
      if (typeof o.websiteSlug !== "string" || typeof o.websiteName !== "string") continue;
      out.push({
        kind: "website",
        websiteId: o.websiteId,
        websiteSlug: o.websiteSlug,
        websiteName: o.websiteName,
        packageName: typeof o.packageName === "string" ? o.packageName : "",
        price: o.price,
        customization:
          o.customization && typeof o.customization === "object"
            ? (o.customization as CustomValues)
            : null,
      });
    }
  }
  return out;
}

function readCart(): CartItem[] {
  try {
    const raw = cookies().get(COOKIE_NAME)?.value;
    if (!raw) return [];
    return normalize(JSON.parse(raw));
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  cookies().set(COOKIE_NAME, JSON.stringify(items), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getCart(): Promise<CartItem[]> {
  return readCart();
}

export async function cartCount(): Promise<number> {
  return readCart().length;
}

export async function cartTotal(): Promise<number> {
  return readCart().reduce((sum, i) => sum + i.price, 0);
}

// One package per website: adding again replaces the previous package.
export async function addToCart(
  websiteId: string,
  packageName: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const website = await db.website.findFirst({
    where: { id: websiteId, status: "PUBLISHED" },
    include: { packages: true },
  });
  if (!website) return { ok: false, error: "سایت پیدا نشد" };

  const pkg = website.packages.find((p) => p.name === packageName);
  if (!pkg) return { ok: false, error: "پکیج معتبر نیست" };

  const cart = readCart().filter((i) => i.websiteId !== websiteId);
  cart.push({
    kind: "website",
    websiteId: website.id,
    websiteSlug: website.slug,
    websiteName: website.name,
    packageName: pkg.name,
    price: pkg.price,
  });
  writeCart(cart);
  await logEvent("add_to_cart", { websiteId: website.id });
  return { ok: true };
}

export async function addProductToCart(
  productId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const product = await db.product.findFirst({
    where: { id: productId, status: "PUBLISHED" },
  });
  if (!product) return { ok: false, error: "محصول پیدا نشد" };

  const cart = readCart().filter((i) => i.productId !== productId);
  cart.push({
    kind: "product",
    productId: product.id,
    productSlug: product.slug,
    productName: product.name,
    packageName: "تکی",
    price: product.price,
  });
  writeCart(cart);
  await logEvent("add_to_cart", { productId: product.id });
  return { ok: true };
}

export async function removeFromCart(id: string): Promise<void> {
  writeCart(readCart().filter((i) => i.websiteId !== id && i.productId !== id));
}

// Customized website: price is re-computed from the database here,
// the client-sent total is only accepted if it matches exactly.
export async function addCustomToCart(
  websiteId: string,
  values: CustomValues,
  claimedTotal: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const website = await db.website.findFirst({
    where: { id: websiteId, status: "PUBLISHED" },
  });
  if (!website) return { ok: false, error: "سایت پیدا نشد" };

  const rows = await db.customizationOption.findMany({ where: { active: true } });
  const options: CustomizationOptionDTO[] = rows.map((o) => ({
    key: o.key,
    label: o.label,
    type: o.type as CustomizationOptionDTO["type"],
    choices: o.choices as CustomizationOptionDTO["choices"],
  }));

  const clean = sanitizeValues(options, values);
  const expected = website.basePrice + computeDelta(options, clean);
  if (claimedTotal !== expected) return { ok: false, error: "قیمت نامعتبر است" };

  const cart = readCart().filter((i) => i.websiteId !== websiteId);
  cart.push({
    kind: "website",
    websiteId: website.id,
    websiteSlug: website.slug,
    websiteName: website.name,
    packageName: "شخصی‌سازی‌شده",
    price: expected,
    customization: clean,
  });
  writeCart(cart);
  await logEvent("add_to_cart", { websiteId: website.id, customized: true });
  return { ok: true };
}

export async function clearCart(): Promise<void> {
  writeCart([]);
}
