import { db } from "@/lib/db";
import { doctorSiteClient } from "./client";
import { websiteToAuditRequest } from "./mapper";
import type { DoctorAuditSummary } from "./types";

type WebsiteRef = { id: string; slug: string };

export const doctorSiteService = {
  // Public link for "analyze in Doctor Site" CTAs.
  auditLinkFor(website: WebsiteRef): DoctorAuditSummary {
    const req = websiteToAuditRequest(website);
    return {
      url: doctorSiteClient.auditUrl(req),
      websiteId: website.id,
    };
  },

  // Records an outbound hop (called from the analytics API, not from UI).
  async logOutbound(input: { websiteId?: string; campaign?: string; userId?: string }) {
    await db.integrationLog.create({
      data: {
        direction: "outbound",
        source: "lian-design",
        campaign: input.campaign ?? null,
        websiteId: input.websiteId ?? null,
        userId: input.userId ?? null,
      },
    });
  },

  // Records an inbound landing (?source=doctor-site...).
  async logInbound(input: { source?: string; campaign?: string; websiteId?: string }) {
    if (!input.source) return;
    await db.integrationLog.create({
      data: {
        direction: "inbound",
        source: input.source,
        campaign: input.campaign ?? null,
        websiteId: input.websiteId ?? null,
      },
    });
  },
};
