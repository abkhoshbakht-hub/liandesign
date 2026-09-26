// Central place for cross-service URLs.
// Doctor Site is a SEPARATE product (built elsewhere — never touch it from here).
// Lian Design only links OUT to it; no analysis logic lives in this codebase.

export function getDoctorSiteUrl(): string {
  return process.env.DOCTOR_SITE_URL ?? "https://doctorsite.example.com";
}

export function doctorSiteAuditUrl(params: { websiteId?: string; source?: string } = {}): string {
  const base = getDoctorSiteUrl().replace(/\/$/, "");
  const search = new URLSearchParams();
  if (params.websiteId) search.set("website_id", params.websiteId);
  search.set("source", params.source ?? "lian-design");
  return `${base}/audit?${search.toString()}`;
}

export function doctorSiteCampaignUrl(campaign: string): string {
  const base = getDoctorSiteUrl().replace(/\/$/, "");
  return `${base}?source=lian-design&campaign=${encodeURIComponent(campaign)}`;
}
