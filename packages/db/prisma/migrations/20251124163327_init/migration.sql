-- AlterTable
ALTER TABLE "lease" ADD COLUMN     "tenantContactId" TEXT;

-- CreateTable
CREATE TABLE "contact" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "notes" TEXT,
    "companyName" TEXT,
    "taxId" TEXT,
    "registrationNumber" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "avatarUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_contact" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_organizationId_idx" ON "contact"("organizationId");

-- CreateIndex
CREATE INDEX "contact_type_idx" ON "contact"("type");

-- CreateIndex
CREATE INDEX "contact_status_idx" ON "contact"("status");

-- CreateIndex
CREATE INDEX "contact_email_idx" ON "contact"("email");

-- CreateIndex
CREATE INDEX "property_contact_propertyId_idx" ON "property_contact"("propertyId");

-- CreateIndex
CREATE INDEX "property_contact_contactId_idx" ON "property_contact"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "property_contact_propertyId_contactId_key" ON "property_contact"("propertyId", "contactId");

-- CreateIndex
CREATE INDEX "lease_tenantContactId_idx" ON "lease"("tenantContactId");

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_contact" ADD CONSTRAINT "property_contact_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_contact" ADD CONSTRAINT "property_contact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease" ADD CONSTRAINT "lease_tenantContactId_fkey" FOREIGN KEY ("tenantContactId") REFERENCES "contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
