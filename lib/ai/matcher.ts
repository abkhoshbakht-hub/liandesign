// Rule-based intent extraction (Persian) + catalog matching.
// No external AI API, no secrets, no cost — transparent scoring.
// An LLM can replace extractIntent later behind the same interface.

export type ExtractedIntent = {
  industrySlug: string | null;
  industryLabel: string | null;
  features: string[];
  budget: number | null; // تومان
  style: string[];
};

export type ScoredWebsite<T> = {
  website: T;
  score: number; // ۰ تا ۱۰۰
  reasons: string[];
  matchedFeatures: string[];
};

const FA_DIGITS: Record<string, string> = {
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};

export function normalizeFa(text: string): string {
  return text
    .replace(/[۰-۹]/g, (d) => FA_DIGITS[d] ?? d)
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[,،]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const INDUSTRIES: { slug: string; label: string; keywords: string[] }[] = [
  { slug: "restaurant", label: "رستوران و کافه", keywords: ["رستوران", "کافه", "فست‌فود", "فست فود", "قهوه", "غذا", "رستوران ایرانی"] },
  { slug: "shop", label: "فروشگاهی", keywords: ["فروشگاه", "فروش", "مغازه", "محصولات", "خرید آنلاین"] },
  { slug: "corporate", label: "شرکتی", keywords: ["شرکت", "شرکتی", "سازمان", "هلدینگ", "موسسه", "مؤسسه"] },
  { slug: "tourism", label: "گردشگری و هتلینگ", keywords: ["هتل", "گردشگری", "سفر", "اقامتگاه", "آژانس", "بوم‌گردی", "بوم گردی"] },
  { slug: "clinic", label: "پزشکی و کلینیک", keywords: ["کلینیک", "پزشکی", "مطب", "دندان", "بیمارستان", "سلامت", "دکتر", "زیبایی"] },
  { slug: "saas", label: "استارتاپی", keywords: ["استارتاپ", "استارتاپی", "نرم‌افزار", "اپلیکیشن", "پلتفرم", "saas"] },
];

const FEATURES: { value: string; label: string; keywords: string[] }[] = [
  { value: "booking", label: "رزرو آنلاین", keywords: ["رزرو", "نوبت"] },
  { value: "payment", label: "درگاه پرداخت", keywords: ["پرداخت", "درگاه", "آنلاین پرداخت"] },
  { value: "blog", label: "وبلاگ", keywords: ["وبلاگ", "مقاله", "مجله"] },
  { value: "shop", label: "بخش فروش", keywords: ["سبد خرید", "فروش محصول"] },
  { value: "gallery", label: "گالری تصاویر", keywords: ["گالری", "عکس", "تصویر"] },
  { value: "chat", label: "چت آنلاین", keywords: ["چت", "گفتگو", "پشتیبانی آنلاین"] },
  { value: "lang-en", label: "نسخه انگلیسی", keywords: ["انگلیسی"] },
  { value: "lang-ar", label: "نسخه عربی", keywords: ["عربی"] },
];

const STYLES = ["لوکس", "مدرن", "مینیمال", "حرفه‌ای", "ساده", "خلاقانه"];

export function extractIntent(prompt: string): ExtractedIntent {
  const text = normalizeFa(prompt);

  let industrySlug: string | null = null;
  let industryLabel: string | null = null;
  for (const ind of INDUSTRIES) {
    if (ind.keywords.some((k) => text.includes(k))) {
      industrySlug = ind.slug;
      industryLabel = ind.label;
      break;
    }
  }

  const features: string[] = [];
  for (const f of FEATURES) {
    if (f.keywords.some((k) => text.includes(k)) && !features.includes(f.value)) {
      features.push(f.value);
    }
  }

  const style = STYLES.filter((s) => text.includes(s));

  // Budget: «۲۰ میلیون»، «۱۵ میلیارد»، «30000000»، «٢ ميليون»...
  let budget: number | null = null;
  const m = text.match(/(\d+(?:\.\d+)?)\s*(میلیارد|میلیون|هزار)?/);
  if (m) {
    const n = parseFloat(m[1]);
    const unit = m[2];
    if (unit === "میلیارد") budget = Math.round(n * 1_000_000_000);
    else if (unit === "میلیون") budget = Math.round(n * 1_000_000);
    else if (unit === "هزار") budget = Math.round(n * 1_000);
    else if (n >= 50_000) budget = Math.round(n);
    else budget = Math.round(n * 1_000_000); // عدد تنها = میلیون
  }

  return { industrySlug, industryLabel, features, budget, style };
}

type Matchable = {
  category: { slug: string; name: string };
  packages: { features: string[] }[];
  description: string | null;
  basePrice: number;
};

export function scoreWebsite<T extends Matchable>(
  website: T,
  intent: ExtractedIntent,
  featureLabels: Record<string, string>
): ScoredWebsite<T> {
  const reasons: string[] = [];
  let score = 0;

  // Industry: 50
  if (intent.industrySlug) {
    if (website.category.slug === intent.industrySlug) {
      score += 50;
      reasons.push(`مناسب ${website.category.name}`);
    }
  } else {
    score += 25;
  }

  // Features: 30
  const haystack = [
    website.description ?? "",
    ...website.packages.flatMap((p) => p.features),
  ].join(" ");
  const matched = intent.features.filter((f) => {
    const kw = FEATURES.find((x) => x.value === f)?.keywords ?? [];
    return kw.some((k) => haystack.includes(k));
  });
  if (intent.features.length === 0) {
    score += 15;
  } else {
    score += Math.round((30 * matched.length) / intent.features.length);
    for (const f of matched) reasons.push(`${featureLabels[f] ?? f} دارد`);
  }

  // Budget: 20
  if (intent.budget == null) {
    score += 10;
  } else if (website.basePrice <= intent.budget) {
    score += 20;
    reasons.push("در محدوده بودجه شما");
  } else if (website.basePrice <= intent.budget * 1.5) {
    score += 10;
    reasons.push("نزدیک به بودجه شما");
  }

  if (reasons.length === 0) reasons.push(`طراحی ${website.category.name}`);

  return { website, score: Math.min(100, score), reasons, matchedFeatures: matched };
}

export function featureLabelMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const f of FEATURES) map[f.value] = f.label;
  return map;
}
