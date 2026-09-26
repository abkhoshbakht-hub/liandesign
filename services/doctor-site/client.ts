import { doctorSiteAuditUrl, doctorSiteCampaignUrl } from "@/lib/config";
import type { DoctorAuditRequest } from "./types";

// Thin URL client. No analysis happens here — ever.
export const doctorSiteClient = {
  auditUrl(req: DoctorAuditRequest = {}): string {
    return doctorSiteAuditUrl({
      websiteId: req.websiteId,
      source: req.source ?? "lian-design",
    });
  },
  campaignUrl(campaign: string): string {
    return doctorSiteCampaignUrl(campaign);
  },
};
