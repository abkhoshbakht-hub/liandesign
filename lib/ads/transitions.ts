// Campaign State Machine — pure transition table (§41).
// No DB, no auth: unit-testable. Used by lib/data/ads-engine.ts.

export const TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PENDING_REVIEW", "CANCELLED"],
  PENDING_REVIEW: ["APPROVED", "REJECTED", "DRAFT"],
  APPROVED: ["PRE_ACCEPTED", "CANCELLED"],
  PRE_ACCEPTED: ["PAYMENT_PENDING", "CANCELLED"],
  PAYMENT_PENDING: ["PAYMENT_RECEIVED", "CANCELLED"],
  PAYMENT_RECEIVED: ["FINAL_APPROVAL_PENDING", "REFUNDED"],
  FINAL_APPROVAL_PENDING: ["FINAL_APPROVED", "REJECTED"],
  FINAL_APPROVED: ["EFFECTIVE", "CANCELLED"],
  EFFECTIVE: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["PAUSED", "COMPLETED"],
  PAUSED: ["ACTIVE", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  REFUNDED: [],
  REJECTED: [],
};

// گذارهای مجاز مالک کمپین (غیر ادمین)
export const OWNER_TRANSITIONS = new Set([
  "DRAFT>PENDING_REVIEW",
  "PENDING_REVIEW>DRAFT",
  "APPROVED>PRE_ACCEPTED",
  "DRAFT>CANCELLED",
  "APPROVED>CANCELLED",
  "PRE_ACCEPTED>PAYMENT_PENDING",
  "PRE_ACCEPTED>CANCELLED",
  "PAYMENT_PENDING>CANCELLED",
  "SCHEDULED>CANCELLED",
  "PAUSED>CANCELLED",
]);

export function canTransition(from: string, to: string, isAdmin: boolean): boolean {
  const allowed = TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) return false;
  if (!isAdmin && !OWNER_TRANSITIONS.has(`${from}>${to}`)) return false;
  return true;
}
