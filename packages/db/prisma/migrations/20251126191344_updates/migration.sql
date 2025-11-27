/*
  Warnings:

  - You are about to drop the column `createdAt` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `agencyId` on the `property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "expense" ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTaxDeductible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurringFrequency" TEXT,
ADD COLUMN     "subcategory" TEXT,
ADD COLUMN     "vendor" TEXT;

-- AlterTable
ALTER TABLE "invoice" DROP COLUMN "createdAt",
ADD COLUMN     "invoiceNumber" TEXT,
ADD COLUMN     "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lineItems" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paidAmount" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "paidAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "lease" ADD COLUMN     "autoRenew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastMonthRent" DECIMAL(65,30),
ADD COLUMN     "lateFeeAmount" DECIMAL(65,30),
ADD COLUMN     "lateFeeType" TEXT,
ADD COLUMN     "leaseType" TEXT NOT NULL DEFAULT 'fixed',
ADD COLUMN     "moveInDate" TIMESTAMP(3),
ADD COLUMN     "moveOutDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentDueDay" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "petDeposit" DECIMAL(65,30),
ADD COLUMN     "propertyId" TEXT,
ADD COLUMN     "renewalNoticeDays" INTEGER DEFAULT 30,
ADD COLUMN     "securityDeposit" DECIMAL(65,30),
ALTER COLUMN "unitId" DROP NOT NULL,
ALTER COLUMN "tenantId" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'draft',
ALTER COLUMN "gracePeriodDays" SET DEFAULT 5;

-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "periodEnd" TIMESTAMP(3),
ADD COLUMN     "periodStart" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "property" DROP COLUMN "agencyId",
ADD COLUMN     "amenities" TEXT,
ADD COLUMN     "askingPrice" DECIMAL(65,30),
ADD COLUMN     "bathrooms" DECIMAL(65,30),
ADD COLUMN     "bedrooms" INTEGER,
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'rent',
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "currencyId" TEXT,
ADD COLUMN     "currentValue" DECIMAL(65,30),
ADD COLUMN     "features" TEXT,
ADD COLUMN     "floors" INTEGER,
ADD COLUMN     "images" TEXT,
ADD COLUMN     "latitude" DECIMAL(65,30),
ADD COLUMN     "longitude" DECIMAL(65,30),
ADD COLUMN     "lotSize" DECIMAL(65,30),
ADD COLUMN     "monthlyRent" DECIMAL(65,30),
ADD COLUMN     "parkingSpaces" INTEGER,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "purchasePrice" DECIMAL(65,30),
ADD COLUMN     "state" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "totalArea" DECIMAL(65,30),
ADD COLUMN     "usableArea" DECIMAL(65,30),
ADD COLUMN     "yearBuilt" INTEGER;

-- AlterTable
ALTER TABLE "unit" ADD COLUMN     "amenities" TEXT,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "depositAmount" DECIMAL(65,30),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "features" TEXT,
ADD COLUMN     "floor" INTEGER,
ADD COLUMN     "images" TEXT,
ADD COLUMN     "name" TEXT;

-- CreateIndex
CREATE INDEX "lease_propertyId_idx" ON "lease"("propertyId");

-- CreateIndex
CREATE INDEX "property_category_idx" ON "property"("category");

-- CreateIndex
CREATE INDEX "property_status_idx" ON "property"("status");

-- CreateIndex
CREATE INDEX "property_currencyId_idx" ON "property"("currencyId");

-- CreateIndex
CREATE INDEX "unit_type_idx" ON "unit"("type");

-- AddForeignKey
ALTER TABLE "lease" ADD CONSTRAINT "lease_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
