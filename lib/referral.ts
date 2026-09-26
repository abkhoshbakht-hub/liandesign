import { cookies } from "next/headers";

export type Referral = {
  source: string;
  campaign: string | null;
  websiteId: string | null;
};

const COOKIE_NAME = "lian-ref";

export function getReferral(): Referral | null {
  try {
    const raw = cookies().get(COOKIE_NAME)?.value;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Referral>;
    if (!parsed.source || typeof parsed.source !== "string") return null;
    return {
      source: parsed.source,
      campaign: typeof parsed.campaign === "string" ? parsed.campaign : null,
      websiteId: typeof parsed.websiteId === "string" ? parsed.websiteId : null,
    };
  } catch {
    return null;
  }
}
