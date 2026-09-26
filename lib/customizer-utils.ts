// Pure helpers shared by server + client. No "use server" here on purpose:
// the customizer UI needs synchronous price math for the live total.

export type OptionChoice = {
  value: string;
  label: string;
  priceDelta: number;
};

export type CustomizationOptionDTO = {
  key: string;
  label: string;
  type: "COLOR" | "FONT" | "PAGE" | "FEATURE";
  choices: OptionChoice[];
};

export type CustomValues = {
  primaryColor?: string;
  font?: string;
  pages?: string[];
  features?: string[];
  businessName?: string;
  phone?: string;
  address?: string;
};

export const MULTI_KEYS = ["pages", "features"] as const;

export function sanitizeValues(options: CustomizationOptionDTO[], values: CustomValues): CustomValues {
  const clean: CustomValues = {};
  for (const opt of options) {
    if (MULTI_KEYS.includes(opt.key as (typeof MULTI_KEYS)[number])) {
      const selected = (values as Record<string, unknown>)[opt.key];
      if (Array.isArray(selected)) {
        const allowed = new Set(opt.choices.map((c) => c.value));
        (clean as Record<string, unknown>)[opt.key] = selected.filter((v) => allowed.has(v));
      }
    } else {
      const v = (values as Record<string, unknown>)[opt.key];
      if (typeof v === "string" && opt.choices.some((c) => c.value === v)) {
        (clean as Record<string, unknown>)[opt.key] = v;
      }
    }
  }
  // Free-text content fields (no price impact).
  for (const k of ["businessName", "phone", "address"] as const) {
    const v = values[k];
    if (typeof v === "string" && v.trim().length > 0) clean[k] = v.trim().slice(0, 200);
  }
  return clean;
}

export function computeDelta(options: CustomizationOptionDTO[], values: CustomValues): number {
  const clean = sanitizeValues(options, values);
  let delta = 0;
  for (const opt of options) {
    if (MULTI_KEYS.includes(opt.key as (typeof MULTI_KEYS)[number])) {
      const selected = ((clean as Record<string, unknown>)[opt.key] as string[]) ?? [];
      for (const v of selected) {
        delta += opt.choices.find((c) => c.value === v)?.priceDelta ?? 0;
      }
    } else {
      const v = (clean as Record<string, unknown>)[opt.key] as string | undefined;
      if (v) delta += opt.choices.find((c) => c.value === v)?.priceDelta ?? 0;
    }
  }
  return delta;
}
