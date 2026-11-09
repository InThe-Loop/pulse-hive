/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,customerIdentityId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "customerIdentityId" TEXT;

-- CreateTable
CREATE TABLE "CustomerIdentity" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneVerifiedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerOtpChallenge" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerOtpChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerIdentity_phone_key" ON "CustomerIdentity"("phone");

-- CreateIndex
CREATE INDEX "CustomerIdentity_phoneVerifiedAt_idx" ON "CustomerIdentity"("phoneVerifiedAt");

-- CreateIndex
CREATE INDEX "CustomerIdentity_isActive_idx" ON "CustomerIdentity"("isActive");

-- CreateIndex
CREATE INDEX "CustomerOtpChallenge_phone_createdAt_idx" ON "CustomerOtpChallenge"("phone", "createdAt");

-- CreateIndex
CREATE INDEX "CustomerOtpChallenge_expiresAt_idx" ON "CustomerOtpChallenge"("expiresAt");

-- CreateIndex
CREATE INDEX "CustomerOtpChallenge_phone_consumedAt_expiresAt_idx" ON "CustomerOtpChallenge"("phone", "consumedAt", "expiresAt");

-- CreateIndex
CREATE INDEX "Customer_customerIdentityId_idx" ON "Customer"("customerIdentityId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_tenantId_customerIdentityId_key" ON "Customer"("tenantId", "customerIdentityId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_customerIdentityId_fkey" FOREIGN KEY ("customerIdentityId") REFERENCES "CustomerIdentity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
