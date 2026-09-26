import { db } from "@/lib/db";

// Product analytics events (§40). Only funnel/product events —
// no analysis scores are ever computed here.
export const ANALYTICS_EVENTS = [
  "website_view",
  "demo_open",
  "customizer_open",
  "customization_save",
  "search",
  "add_to_cart",
  "checkout_start",
  "purchase",
  "doctor_site_click",
  "ai_recommendation",
  "custom_design_request",
  // Contract funnel (§46) — ad delivery events live in dedicated tables
  "contract_viewed",
  "pre_acceptance_completed",
  "checkout_started",
  "payment_completed",
  "final_approval_completed",
  // Shop funnel (§48)
  "package_view",
  "package_purchase",
  "credit_purchase",
  "service_upsell_view",
  "service_upsell_purchase",
  "landing_page_upsell",
  "compare_add",
  "payment_started",
  "payment_success",
  "pre_acceptance_started",
  "final_approval_started",
  "campaign_activated",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export async function logEvent(
  name: AnalyticsEventName,
  props?: Record<string, string | number | boolean | null>,
  userId?: string
): Promise<void> {
  try {
    await db.analyticsEvent.create({
      data: { name, props: props ?? {}, userId: userId ?? null },
    });
  } catch {
    // Analytics must never break the user flow.
  }
}
