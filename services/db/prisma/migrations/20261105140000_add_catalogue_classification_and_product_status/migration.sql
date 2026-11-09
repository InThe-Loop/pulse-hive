-- Create catalogue classification and product status enums.

CREATE TYPE "CatalogueType" AS ENUM (
    'PRODUCT',
    'COMBO_SPECIAL',
    'RESELLER_PACK'
);

CREATE TYPE "ProductStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);

-- Add the new fields with safe defaults for existing products.

ALTER TABLE "Product"
ADD COLUMN "catalogueType" "CatalogueType" NOT NULL DEFAULT 'PRODUCT',
ADD COLUMN "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';

-- Preserve the existing active/inactive state.

UPDATE "Product"
SET "status" = CASE
    WHEN "active" = TRUE THEN 'ACTIVE'::"ProductStatus"
    ELSE 'INACTIVE'::"ProductStatus"
END;

-- Classify the existing Glowa Vee collections.

UPDATE "Product"
SET "catalogueType" = 'COMBO_SPECIAL'
WHERE "name" IN (
    'All Glam',
    'Body Health',
    'Skin Tag Removal Combo',
    'Collagen Creams & Serum',
    'Famous Box'
);

-- Remove the old Boolean index and column.

DROP INDEX IF EXISTS "Product_tenantId_active_idx";

ALTER TABLE "Product"
DROP COLUMN "active";

-- Add indexes for tenant-scoped catalogue filtering and ordering.

CREATE INDEX "Product_tenantId_status_idx"
ON "Product"("tenantId", "status");

CREATE INDEX "Product_tenantId_catalogueType_status_idx"
ON "Product"("tenantId", "catalogueType", "status");

CREATE INDEX "Product_tenantId_catalogueType_status_createdAt_id_idx"
ON "Product"("tenantId", "catalogueType", "status", "createdAt", "id");
