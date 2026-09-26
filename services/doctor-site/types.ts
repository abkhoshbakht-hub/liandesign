// Types for the Doctor Site integration (§28).
// Doctor Site is a SEPARATE product. Today the integration is URL-based;
// these types keep the door open for a future read-only Audit API
// without changing any caller.

export type DoctorAuditRequest = {
  websiteId?: string;
  websiteSlug?: string;
  source?: string;
  campaign?: string;
};

export type DoctorAuditSummary = {
  url: string;
  websiteId?: string;
  campaign?: string;
};

// Shape of a FUTURE read-only Audit API response (not used yet).
export type DoctorAuditResult = {
  performance?: number;
  seo?: number;
  ux?: number;
  verdict?: string;
  checkedAt?: string;
};
