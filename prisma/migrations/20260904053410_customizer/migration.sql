-- CreateEnum
CREATE TYPE "CustomizationOptionType" AS ENUM ('COLOR', 'FONT', 'PAGE', 'FEATURE');

-- CreateTable
CREATE TABLE "CustomizationOption" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "CustomizationOptionType" NOT NULL,
    "choices" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomizationOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customization" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomizationOption_key_key" ON "CustomizationOption"("key");

-- CreateIndex
CREATE INDEX "Customization_websiteId_idx" ON "Customization"("websiteId");

-- CreateIndex
CREATE UNIQUE INDEX "Customization_userId_websiteId_key" ON "Customization"("userId", "websiteId");

-- AddForeignKey
ALTER TABLE "Customization" ADD CONSTRAINT "Customization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customization" ADD CONSTRAINT "Customization_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;
