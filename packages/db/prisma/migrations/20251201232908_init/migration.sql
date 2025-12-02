-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "countryCode" TEXT NOT NULL DEFAULT 'BR';

-- CreateTable
CREATE TABLE "lease_contact" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lease_contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lease_contact_leaseId_idx" ON "lease_contact"("leaseId");

-- CreateIndex
CREATE INDEX "lease_contact_contactId_idx" ON "lease_contact"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "lease_contact_leaseId_contactId_role_key" ON "lease_contact"("leaseId", "contactId", "role");

-- CreateIndex
CREATE INDEX "organization_countryCode_idx" ON "organization"("countryCode");

-- AddForeignKey
ALTER TABLE "lease_contact" ADD CONSTRAINT "lease_contact_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "lease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_contact" ADD CONSTRAINT "lease_contact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
