-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PRE_ACCEPTED', 'PAYMENT_PENDING', 'PAYMENT_RECEIVED', 'FINAL_APPROVAL_PENDING', 'FINAL_APPROVED', 'EFFECTIVE', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('CPM', 'CPC', 'CPL', 'CPA', 'FIXED_TIME', 'FIXED_IMPRESSIONS', 'ROTATION', 'EXCLUSIVE', 'PACKAGE', 'CUSTOM_QUOTE');

-- CreateTable
CREATE TABLE "AdvertiserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdvertiserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdPlacement" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "exclusive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdInventory" (
    "id" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "allocated" INTEGER NOT NULL DEFAULT 0,
    "overbooking" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryAllocation" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "pricingModel" "PricingModel" NOT NULL DEFAULT 'CPM',
    "budget" INTEGER NOT NULL DEFAULT 0,
    "dailyBudget" INTEGER,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignItem" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "websiteId" TEXT,
    "productId" TEXT,
    "keyword" TEXT,
    "price" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingRule" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingFactor" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "factor" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TargetingRule" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TargetingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrequencyCap" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'CAMPAIGN',
    "limit" INTEGER NOT NULL,
    "period" TEXT NOT NULL DEFAULT 'DAY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FrequencyCap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creative" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'IMAGE',
    "fileUrl" TEXT,
    "html" TEXT,
    "linkUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreativeVersion" (
    "id" TEXT NOT NULL,
    "creativeId" TEXT NOT NULL,
    "fileUrl" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreativeVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolicyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvertisingContract" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "policyId" TEXT,
    "preAcceptedAt" TIMESTAMP(3),
    "finalApprovedAt" TIMESTAMP(3),
    "approvalMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdvertisingContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractVersion" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractSnapshot" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "hash" TEXT NOT NULL,
    "final" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractAcceptance" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "method" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvertisingCredit" (
    "id" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdvertisingCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "items" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvertiserSubscription" (
    "id" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdvertiserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpressionEvent" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT,
    "placementKey" TEXT NOT NULL,
    "suspicious" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImpressionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClickEvent" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT,
    "placementKey" TEXT NOT NULL,
    "suspicious" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversionEvent" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'generic',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdvertiserProfile_userId_key" ON "AdvertiserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdPlacement_key_key" ON "AdPlacement"("key");

-- CreateIndex
CREATE INDEX "AdInventory_placementId_idx" ON "AdInventory"("placementId");

-- CreateIndex
CREATE UNIQUE INDEX "AdInventory_placementId_period_key" ON "AdInventory"("placementId", "period");

-- CreateIndex
CREATE INDEX "InventoryAllocation_inventoryId_idx" ON "InventoryAllocation"("inventoryId");

-- CreateIndex
CREATE INDEX "InventoryAllocation_campaignId_idx" ON "InventoryAllocation"("campaignId");

-- CreateIndex
CREATE INDEX "Campaign_advertiserId_idx" ON "Campaign"("advertiserId");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE INDEX "CampaignItem_campaignId_idx" ON "CampaignItem"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "PricingRule_key_key" ON "PricingRule"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PricingFactor_key_key" ON "PricingFactor"("key");

-- CreateIndex
CREATE INDEX "TargetingRule_campaignId_idx" ON "TargetingRule"("campaignId");

-- CreateIndex
CREATE INDEX "FrequencyCap_campaignId_idx" ON "FrequencyCap"("campaignId");

-- CreateIndex
CREATE INDEX "Creative_campaignId_idx" ON "Creative"("campaignId");

-- CreateIndex
CREATE INDEX "CreativeVersion_creativeId_idx" ON "CreativeVersion"("creativeId");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyVersion_version_key" ON "PolicyVersion"("version");

-- CreateIndex
CREATE INDEX "AdvertisingContract_campaignId_idx" ON "AdvertisingContract"("campaignId");

-- CreateIndex
CREATE INDEX "ContractVersion_contractId_idx" ON "ContractVersion"("contractId");

-- CreateIndex
CREATE INDEX "ContractSnapshot_versionId_idx" ON "ContractSnapshot"("versionId");

-- CreateIndex
CREATE INDEX "ContractAcceptance_versionId_idx" ON "ContractAcceptance"("versionId");

-- CreateIndex
CREATE INDEX "AdvertisingCredit_advertiserId_idx" ON "AdvertisingCredit"("advertiserId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignPackage_slug_key" ON "CampaignPackage"("slug");

-- CreateIndex
CREATE INDEX "AdvertiserSubscription_advertiserId_idx" ON "AdvertiserSubscription"("advertiserId");

-- CreateIndex
CREATE INDEX "ImpressionEvent_campaignId_idx" ON "ImpressionEvent"("campaignId");

-- CreateIndex
CREATE INDEX "ImpressionEvent_placementKey_idx" ON "ImpressionEvent"("placementKey");

-- CreateIndex
CREATE INDEX "ImpressionEvent_createdAt_idx" ON "ImpressionEvent"("createdAt");

-- CreateIndex
CREATE INDEX "ClickEvent_campaignId_idx" ON "ClickEvent"("campaignId");

-- CreateIndex
CREATE INDEX "ClickEvent_placementKey_idx" ON "ClickEvent"("placementKey");

-- CreateIndex
CREATE INDEX "ClickEvent_createdAt_idx" ON "ClickEvent"("createdAt");

-- CreateIndex
CREATE INDEX "ConversionEvent_campaignId_idx" ON "ConversionEvent"("campaignId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "SecurityEvent_kind_idx" ON "SecurityEvent"("kind");

-- CreateIndex
CREATE INDEX "SecurityEvent_createdAt_idx" ON "SecurityEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "AdInventory" ADD CONSTRAINT "AdInventory_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "AdPlacement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAllocation" ADD CONSTRAINT "InventoryAllocation_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "AdInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAllocation" ADD CONSTRAINT "InventoryAllocation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "AdvertiserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignItem" ADD CONSTRAINT "CampaignItem_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetingRule" ADD CONSTRAINT "TargetingRule_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrequencyCap" ADD CONSTRAINT "FrequencyCap_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creative" ADD CONSTRAINT "Creative_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreativeVersion" ADD CONSTRAINT "CreativeVersion_creativeId_fkey" FOREIGN KEY ("creativeId") REFERENCES "Creative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisingContract" ADD CONSTRAINT "AdvertisingContract_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisingContract" ADD CONSTRAINT "AdvertisingContract_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "PolicyVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractVersion" ADD CONSTRAINT "ContractVersion_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "AdvertisingContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractSnapshot" ADD CONSTRAINT "ContractSnapshot_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ContractVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractAcceptance" ADD CONSTRAINT "ContractAcceptance_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ContractVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisingCredit" ADD CONSTRAINT "AdvertisingCredit_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "AdvertiserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertiserSubscription" ADD CONSTRAINT "AdvertiserSubscription_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "AdvertiserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
