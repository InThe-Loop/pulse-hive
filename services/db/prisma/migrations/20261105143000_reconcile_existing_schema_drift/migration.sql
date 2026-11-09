-- Reconcile historical indexes that are absent from the current schema.

DROP INDEX IF EXISTS "Payment_transactionReference_idx";

DROP INDEX IF EXISTS "TenantInvitation_tenantId_expiresAt_idx";

-- Prisma manages these timestamps through @updatedAt.
-- They should not have database-level defaults.

ALTER TABLE "User"
ALTER COLUMN "updatedAt" DROP DEFAULT;

ALTER TABLE "UserTenant"
ALTER COLUMN "updatedAt" DROP DEFAULT;