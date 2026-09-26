// Pricing Engine — Phase 2 (§18-19).
// Pure functions (no DB): inputs are active rules/factors from DB.
// Price (تومان) = Base × Placement × Device × Priority × Exclusivity × Duration × Demand

export interface QuoteInput {
  model: "CPM" | "CPC";
  base: number; // base_cpm یا base_cpc از PricingRule
  placementKey: string; // homepage.hero
  factors: Record<string, number>; // key → factor (فقط activeها)
  device?: "desktop" | "mobile" | "tablet";
  priority?: boolean;
  exclusive?: boolean;
  months?: number; // multi-month (§29) — تخفیف از factor: duration_Nm
  demandFactor?: number; // seasonal/demand (§30) — از factor: demand_* یا ورودی ادمین
}

export function quote(input: QuoteInput): number {
  const f = input.factors;
  let price = input.base;

  const placementKey = `placement_${input.placementKey.replace(/\./g, "_")}`;
  price *= f[placementKey] ?? f["placement_default"] ?? 1;

  if (input.device === "mobile") price *= f["device_mobile"] ?? 1;
  if (input.priority) price *= f["priority_boost"] ?? 1;
  if (input.exclusive) price *= f["exclusive"] ?? 1;

  if (input.months && input.months > 1) {
    const discount = f[`duration_${input.months}m`] ?? 0; // درصد تخفیف، مثل 7
    price *= 1 - discount / 100;
  }

  if (input.demandFactor) price *= input.demandFactor;

  return Math.max(0, Math.round(price));
}

// مبلغ کل کمپین از روی مدل قیمت‌گذاری
export function campaignTotal(opts: {
  model: "CPM" | "CPC" | "FIXED_TIME" | "FIXED_IMPRESSIONS" | "ROTATION" | "EXCLUSIVE" | "PACKAGE" | "CUSTOM_QUOTE";
  unitPrice: number; // خروجی quote (برای CPM/CPC) یا قیمت ثابت
  impressions?: number;
  clicks?: number;
}): number {
  switch (opts.model) {
    case "CPM":
      return Math.round((opts.unitPrice * (opts.impressions ?? 0)) / 1000);
    case "CPC":
      return Math.round(opts.unitPrice * (opts.clicks ?? 0));
    default:
      return Math.round(opts.unitPrice); // FIXED_*, ROTATION, EXCLUSIVE, PACKAGE, CUSTOM_QUOTE
  }
}
