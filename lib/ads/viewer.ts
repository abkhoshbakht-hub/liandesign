import { headers } from "next/headers";
import { deviceFromUA, type DeviceKind } from "@/lib/ads/targeting";

export interface Viewer {
  ip?: string | null;
  device?: DeviceKind;
  categoryId?: string | null;
}

// NOTE: فقط در Server Component / Route Handler صدا بزنید
export function getViewer(categoryId?: string | null): Viewer {
  const h = headers();
  const fwd = h.get("x-forwarded-for");
  return {
    ip: fwd ? fwd.split(",")[0].trim().slice(0, 45) : null,
    device: deviceFromUA(h.get("user-agent") ?? "") as DeviceKind,
    categoryId: categoryId ?? null,
  };
}
