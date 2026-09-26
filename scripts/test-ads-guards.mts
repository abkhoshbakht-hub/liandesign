// Integration guard tests (§92). Run: ADS_TEST_SEAM=1 npx tsx scripts/test-ads-guards.mts
// Self-cleaning: all test rows are deleted at the end.
import "dotenv/config";
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { setTestActor } from "../lib/test-actor";
import { transitionCampaign, allocateInventory, releaseAllocation } from "../lib/data/ads-engine";
import {
  preAcceptContract,
  createCampaignOrder,
  confirmPaymentReceived,
  finalApproveCampaign,
  stableStringify,
} from "../lib/data/ads-contract";

try {
  const envPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".env");
  if (!process.env.DATABASE_URL && existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^\s*DATABASE_URL\s*=\s*(.+?)\s*$/);
      if (m) process.env.DATABASE_URL = m[1].replace(/^["']|["']$/g, "");
    }
  }
} catch {}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

let pass = 0;
let fail = 0;
function eq(name: string, got: unknown, want: unknown) {
  if (got === want) {
    pass++;
    console.log(`ok: ${name}`);
  } else {
    fail++;
    console.log(`FAIL: ${name} — got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  }
}

const EMAIL = "guard-test@liandesign.test";
const created = { users: [] as string[], campaigns: [] as string[], orders: [] as string[], allocations: [] as string[] };

try {
  const admin = await db.user.findUniqueOrThrow({ where: { email: "admin@liandesign.com" } });
  const owner = await db.user.create({
    data: { email: EMAIL, name: "Guard Test", passwordHash: "x", role: "CUSTOMER" },
  });
  created.users.push(owner.id);
  const profile = await db.advertiserProfile.create({ data: { userId: owner.id, company: "GT", phone: "09" } });

  const asOwner = () => setTestActor({ id: owner.id, role: "CUSTOMER" });
  const asAdmin = () => setTestActor({ id: admin.id, role: "ADMIN" });

  // ── Reservation (§71): over-allocation must fail ──
  const period = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const placement = await db.adPlacement.findUniqueOrThrow({ where: { key: "homepage.hero" } });
  const inv0 = await db.adInventory.findUniqueOrThrow({
    where: { placementId_period: { placementId: placement.id, period } },
  });
  const camp0 = await db.campaign.create({
    data: { advertiserId: profile.id, title: "GUARD-ALLOC", status: "DRAFT", pricingModel: "CPM", budget: 1000 },
  });
  created.campaigns.push(camp0.id);
  asAdmin();
  const over = await allocateInventory(camp0.id, placement.id, period, inv0.capacity - inv0.allocated + 1);
  eq("over-allocation rejected", over.ok, false);
  const okAlloc = await allocateInventory(camp0.id, placement.id, period, 10);
  eq("valid allocation accepted", okAlloc.ok, true);
  const inv1 = await db.adInventory.findUniqueOrThrow({
    where: { placementId_period: { placementId: placement.id, period } },
  });
  eq("allocated incremented", inv1.allocated, inv0.allocated + 10);
  const allocRow = await db.inventoryAllocation.findFirstOrThrow({
    where: { campaignId: camp0.id },
    orderBy: { createdAt: "desc" },
  });
  const rel = await releaseAllocation(allocRow.id);
  eq("release accepted", rel.ok, true);
  const inv2 = await db.adInventory.findUniqueOrThrow({
    where: { placementId_period: { placementId: placement.id, period } },
  });
  eq("allocated restored", inv2.allocated, inv0.allocated);

  // ── Full legal path ──
  const camp = await db.campaign.create({
    data: {
      advertiserId: profile.id,
      title: "GUARD-FLOW",
      status: "DRAFT",
      pricingModel: "CPM",
      budget: 500000,
      items: { create: { placementId: "marketplace.native", kind: "SPONSORED_WEBSITE", websiteId: (await db.website.findFirstOrThrow({ where: { status: "PUBLISHED" } })).id } },
    },
  });
  created.campaigns.push(camp.id);

  asOwner();
  eq("submit", (await transitionCampaign(camp.id, "PENDING_REVIEW")).ok, true);
  asAdmin();
  eq("approve", (await transitionCampaign(camp.id, "APPROVED")).ok, true);
  asOwner();
  const preRes = await preAcceptContract(camp.id);
  if (!preRes.ok) console.log("pre-accept error:", (preRes as { error?: string }).error);
  eq("pre-accept", preRes.ok, true);
  // idempotency: second pre-accept is ok, no duplicate
  eq("pre-accept idempotent", (await preAcceptContract(camp.id)).ok, true);
  const preCount = await db.contractAcceptance.count({
    where: { kind: "PRE", version: { contract: { campaignId: camp.id } } },
  });
  eq("single PRE acceptance", preCount, 1);

  const orderRes = await createCampaignOrder(camp.id);
  if (!orderRes.ok) console.log("order error:", (orderRes as { error?: string }).error);
  eq("order", orderRes.ok, true);
  const withOrder = await db.campaign.findUniqueOrThrow({ where: { id: camp.id } });
  if (withOrder.orderId) created.orders.push(withOrder.orderId);

  // MUST TEST 1 (§92): payment success WITHOUT final approval → ACTIVE must fail
  asAdmin();
  eq("skip-to-active blocked", (await transitionCampaign(camp.id, "ACTIVE")).ok, false);

  // pay (simulate manual confirm) → advance to FINAL_APPROVAL_PENDING
  await db.order.update({ where: { id: withOrder.orderId! }, data: { status: "PAID" } });
  eq("payment received", (await confirmPaymentReceived(camp.id)).ok, true);
  eq("still blocked before final", (await transitionCampaign(camp.id, "ACTIVE")).ok, false);

  // گارد واقعی §30/§66: پرداخت شده ولی قرارداد نهایی ندارد — حتی از SCHEDULED هم نباید فعال شود
  await db.campaign.update({ where: { id: camp.id }, data: { status: "SCHEDULED" } });
  eq("MUST1: paid without final approval → ACTIVE blocked", (await transitionCampaign(camp.id, "ACTIVE")).ok, false);
  await db.campaign.update({ where: { id: camp.id }, data: { status: "FINAL_APPROVAL_PENDING" } });

  eq("final approve", (await finalApproveCampaign(camp.id)).ok, true);
  eq("final approve idempotent", (await finalApproveCampaign(camp.id)).ok, true);
  const finalCount = await db.contractAcceptance.count({
    where: { kind: "FINAL", version: { contract: { campaignId: camp.id } } },
  });
  eq("single FINAL acceptance", finalCount, 1);

  // snapshot integrity (§47-48): recompute hash of final snapshot
  const snap = await db.contractSnapshot.findFirstOrThrow({
    where: { final: true, version: { contract: { campaignId: camp.id } } },
  });
  const recomputed = createHash("sha256").update(stableStringify(snap.payload)).digest("hex");
  eq("snapshot hash matches", snap.hash, recomputed);

  eq("effective", (await transitionCampaign(camp.id, "EFFECTIVE")).ok, true);
  eq("scheduled", (await transitionCampaign(camp.id, "SCHEDULED")).ok, true);
  eq("activate after final", (await transitionCampaign(camp.id, "ACTIVE")).ok, true);

  // snapshot still intact after later transitions
  const snap2 = await db.contractSnapshot.findUniqueOrThrow({ where: { id: snap.id } });
  eq("snapshot immutable", snap2.hash, snap.hash);

  // MUST TEST 2 (§92): final approval WITHOUT payment → ACTIVE must fail
  const camp2 = await db.campaign.create({
    data: { advertiserId: profile.id, title: "GUARD-NOPAY", status: "DRAFT", pricingModel: "CPM", budget: 100 },
  });
  created.campaigns.push(camp2.id);
  await db.campaign.update({ where: { id: camp2.id }, data: { status: "FINAL_APPROVED" } });
  eq("active without payment/contract blocked", (await transitionCampaign(camp2.id, "ACTIVE")).ok, false);
  // (EFFECTIVE/SCHEDULED are harmless intermediates; ACTIVE is the guarded gate.)

  console.log(`\n${pass} passed, ${fail} failed`);
} finally {
  setTestActor(null);
  for (const id of created.orders) {
    await db.order.delete({ where: { id } }).catch(() => {});
  }
  for (const id of created.campaigns) {
    await db.campaign.delete({ where: { id } }).catch(() => {});
  }
  await db.notification.deleteMany({ where: { userId: { in: created.users } } });
  await db.analyticsEvent.deleteMany({ where: { userId: { in: created.users } } });
  await db.auditLog.deleteMany({ where: { actorId: { in: created.users } } });
  await db.advertiserProfile.deleteMany({ where: { userId: { in: created.users } } });
  for (const id of created.users) {
    await db.user.delete({ where: { id } }).catch(() => {});
  }
  const left = await db.user.count({ where: { email: EMAIL } });
  console.log(`cleanup: remaining test users = ${left}`);
  await db.$disconnect();
}

process.exit(fail > 0 ? 1 : 0);
