-- AlterTable
ALTER TABLE "document" ADD COLUMN     "saleId" TEXT;

-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "saleId" TEXT,
ALTER COLUMN "leaseId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "unit" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'rent',
ADD COLUMN     "purchasePrice" DECIMAL(65,30),
ADD COLUMN     "salePrice" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "sale" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "unitId" TEXT,
    "buyerId" TEXT,
    "buyerContactId" TEXT,
    "saleType" TEXT NOT NULL DEFAULT 'purchase',
    "contractDate" TIMESTAMP(3) NOT NULL,
    "closingDate" TIMESTAMP(3),
    "possessionDate" TIMESTAMP(3),
    "askingPrice" DECIMAL(65,30) NOT NULL,
    "salePrice" DECIMAL(65,30) NOT NULL,
    "downPayment" DECIMAL(65,30),
    "downPaymentDate" TIMESTAMP(3),
    "financingAmount" DECIMAL(65,30),
    "financingTerm" INTEGER,
    "interestRate" DECIMAL(65,30),
    "monthlyPayment" DECIMAL(65,30),
    "currencyId" TEXT NOT NULL,
    "closingCosts" DECIMAL(65,30),
    "taxes" DECIMAL(65,30),
    "transferFees" DECIMAL(65,30),
    "otherFees" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "contractStatus" TEXT,
    "inspectionContingency" BOOLEAN NOT NULL DEFAULT true,
    "financingContingency" BOOLEAN NOT NULL DEFAULT true,
    "appraisalContingency" BOOLEAN NOT NULL DEFAULT false,
    "homeSaleContingency" BOOLEAN NOT NULL DEFAULT false,
    "contingencyDeadline" TIMESTAMP(3),
    "offerDate" TIMESTAMP(3),
    "acceptanceDate" TIMESTAMP(3),
    "inspectionDate" TIMESTAMP(3),
    "appraisalDate" TIMESTAMP(3),
    "finalWalkthroughDate" TIMESTAMP(3),
    "contractDocumentUrl" TEXT,
    "notes" TEXT,
    "terms" TEXT,
    "agentCommission" DECIMAL(65,30),
    "agentCommissionPercent" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sale_propertyId_idx" ON "sale"("propertyId");

-- CreateIndex
CREATE INDEX "sale_unitId_idx" ON "sale"("unitId");

-- CreateIndex
CREATE INDEX "sale_buyerId_idx" ON "sale"("buyerId");

-- CreateIndex
CREATE INDEX "sale_buyerContactId_idx" ON "sale"("buyerContactId");

-- CreateIndex
CREATE INDEX "sale_status_idx" ON "sale"("status");

-- CreateIndex
CREATE INDEX "sale_currencyId_idx" ON "sale"("currencyId");

-- CreateIndex
CREATE INDEX "sale_contractDate_idx" ON "sale"("contractDate");

-- CreateIndex
CREATE INDEX "sale_closingDate_idx" ON "sale"("closingDate");

-- CreateIndex
CREATE INDEX "document_saleId_idx" ON "document"("saleId");

-- CreateIndex
CREATE INDEX "payment_saleId_idx" ON "payment"("saleId");

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale" ADD CONSTRAINT "sale_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale" ADD CONSTRAINT "sale_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale" ADD CONSTRAINT "sale_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale" ADD CONSTRAINT "sale_buyerContactId_fkey" FOREIGN KEY ("buyerContactId") REFERENCES "contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale" ADD CONSTRAINT "sale_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
