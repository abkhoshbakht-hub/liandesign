import { z } from "zod";

// ── Phase C: اعتبارسنجی ورودی‌های تبلیغات (§66) ──

export const campaignKindSchema = z.enum([
  "SPONSORED_WEBSITE",
  "FEATURED_WEBSITE",
  "SPONSORED_PRODUCT",
  "SPONSORED_SEARCH",
  "CATEGORY_SPONSOR",
  "DISPLAY",
  "BOOST",
  "FEATURED_PRODUCT",
]);

export const campaignSubmitSchema = z.object({
  title: z.string().trim().min(3, "عنوان کوتاه است").max(120),
  kind: campaignKindSchema,
  websiteId: z.string().optional(),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  keyword: z.string().trim().max(100).optional(),
  bid: z.number().int().positive().optional(),
  budget: z.number().int().positive("بودجه نامعتبر است"),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  placementId: z.string().optional(),
});

export const allocateSchema = z.object({
  campaignId: z.string().min(1),
  placementId: z.string().min(1),
  period: z.string().regex(/^\d{4}-\d{2}$/, "دوره نامعتبر است"),
  amount: z.number().int().positive("مقدار نامعتبر است"),
});

export const pricingRuleSchema = z.object({
  key: z.string().trim().min(1).max(80),
  value: z.number().int().min(0, "مبلغ نامعتبر است"),
});

export const pricingFactorSchema = z.object({
  key: z.string().trim().min(1).max(80),
  factor: z.number().positive("ضریب نامعتبر است").max(100),
});

export function firstError(e: z.ZodError): string {
  return e.issues[0]?.message ?? "ورودی نامعتبر است";
}
