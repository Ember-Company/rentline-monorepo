/*
  Warnings:

  - You are about to drop the column `lateFeeAmount` on the `lease` table. All the data in the column will be lost.
  - You are about to drop the column `lateFeePercentage` on the `lease` table. All the data in the column will be lost.
  - You are about to drop the column `lateFeeType` on the `lease` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "lease" DROP COLUMN "lateFeeAmount",
DROP COLUMN "lateFeePercentage",
DROP COLUMN "lateFeeType",
ADD COLUMN     "additionalCharges" TEXT,
ADD COLUMN     "furnishing" TEXT,
ADD COLUMN     "lateFees" TEXT,
ADD COLUMN     "leaseExpiryReminderDays" INTEGER,
ADD COLUMN     "leaseExpiryReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentFrequency" TEXT NOT NULL DEFAULT 'monthly',
ADD COLUMN     "proRataAmount" DECIMAL(65,30),
ADD COLUMN     "proRataEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rentOverdueReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rentReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requireRentersInsurance" BOOLEAN NOT NULL DEFAULT false;
