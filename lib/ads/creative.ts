// Creative validation — pure (§54-55). Unit-testable.

export interface CreativeInput {
  kind: string;
  fileUrl?: string | null;
  html?: string | null;
  linkUrl?: string | null;
  width?: number | null;
  height?: number | null;
}

const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

export function validateCreative(c: CreativeInput): string[] {
  const errors: string[] = [];

  if (c.linkUrl) {
    try {
      const u = new URL(c.linkUrl);
      if (u.protocol !== "http:" && u.protocol !== "https:") errors.push("لینک مقصد نامعتبر است");
    } catch {
      errors.push("لینک مقصد نامعتبر است");
    }
  }

  if (c.kind === "IMAGE") {
    if (!c.fileUrl) {
      errors.push("فایل بنر لازم است");
    } else {
      const lower = c.fileUrl.toLowerCase().split("?")[0];
      if (!IMAGE_EXT.some((e) => lower.endsWith(e)) && !lower.startsWith("blob:") && !lower.startsWith("data:")) {
        errors.push("فرمت فایل باید تصویر باشد");
      }
    }
    if (c.width !== null && c.width !== undefined && c.width <= 0) errors.push("عرض نامعتبر است");
    if (c.height !== null && c.height !== undefined && c.height <= 0) errors.push("ارتفاع نامعتبر است");
  }

  if (c.kind === "HTML" && !c.html?.trim()) errors.push("کد HTML لازم است");

  return errors;
}

export const CREATIVE_STATUS_FA: Record<string, string> = {
  DRAFT: "پیش‌نویس",
  PENDING: "در انتظار بررسی",
  APPROVED: "تأیید شده",
  REJECTED: "رد شده",
};
