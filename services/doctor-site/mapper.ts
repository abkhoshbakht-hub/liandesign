import type { DoctorAuditRequest } from "./types";

type WebsiteRef = { id: string; slug: string };

// Maps a Lian website to Doctor Site audit parameters.
// No scores are computed here — mapping only.
export function websiteToAuditRequest(website: WebsiteRef): DoctorAuditRequest {
  return {
    websiteId: website.id,
    websiteSlug: website.slug,
    source: "lian-design",
  };
}
