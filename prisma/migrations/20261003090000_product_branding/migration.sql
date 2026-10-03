-- Product: fields for template products + branding service
ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "brandingPrice" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "demoUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "includes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "license" TEXT;

-- Enum for branding requests
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BrandingRequestStatus') THEN
    CREATE TYPE "BrandingRequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DELIVERED', 'CANCELLED');
  END IF;
END
$$;

-- Table for logo-branding requests
CREATE TABLE IF NOT EXISTS "BrandingRequest" (
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

CREATE INDEX IF NOT EXISTS "BrandingRequest_status_idx" ON "BrandingRequest"("status");
CREATE INDEX IF NOT EXISTS "BrandingRequest_productId_idx" ON "BrandingRequest"("productId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'BrandingRequest_productId_fkey'
  ) THEN
    ALTER TABLE "BrandingRequest"
      ADD CONSTRAINT "BrandingRequest_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;