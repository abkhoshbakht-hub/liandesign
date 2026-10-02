-- Add fields for template products (branding service)
ALTER TABLE "Product"
  ADD COLUMN "brandingPrice" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "demoUrl" TEXT,
  ADD COLUMN "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "includes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "license" TEXT;

-- Enum for branding requests
CREATE TYPE "BrandingRequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DELIVERED', 'CANCELLED');

-- Table for logo-branding requests
CREATE TABLE "BrandingRequest" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "brandNameEn" TEXT,
    "domain" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "notes" TEXT,
    "adminNote" TEXT,
    "status" "BrandingRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandingRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BrandingRequest_status_idx" ON "BrandingRequest"("status");
CREATE INDEX "BrandingRequest_productId_idx" ON "BrandingRequest"("productId");

ALTER TABLE "BrandingRequest"
  ADD CONSTRAINT "BrandingRequest_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;