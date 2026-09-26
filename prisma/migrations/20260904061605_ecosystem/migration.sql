-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "referralCampaign" TEXT,
ADD COLUMN     "referralSource" TEXT;

-- CreateTable
CREATE TABLE "ExternalService" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalServiceConfig" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalServiceConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalReference" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "websiteId" TEXT,
    "externalId" TEXT,
    "kind" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationLog" (
    "id" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "source" TEXT,
    "campaign" TEXT,
    "websiteId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "props" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalService_key_key" ON "ExternalService"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalServiceConfig_serviceId_key_key" ON "ExternalServiceConfig"("serviceId", "key");

-- CreateIndex
CREATE INDEX "ExternalReference_serviceId_idx" ON "ExternalReference"("serviceId");

-- CreateIndex
CREATE INDEX "ExternalReference_websiteId_idx" ON "ExternalReference"("websiteId");

-- CreateIndex
CREATE INDEX "IntegrationLog_direction_idx" ON "IntegrationLog"("direction");

-- CreateIndex
CREATE INDEX "IntegrationLog_createdAt_idx" ON "IntegrationLog"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_name_idx" ON "AnalyticsEvent"("name");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "ExternalServiceConfig" ADD CONSTRAINT "ExternalServiceConfig_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ExternalService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalReference" ADD CONSTRAINT "ExternalReference_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ExternalService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
