/*
  Warnings:

  - You are about to drop the column `medicationId` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the `Medication` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_medicationId_fkey";

-- DropIndex
DROP INDEX "Prescription_medicationId_idx";

-- AlterTable
ALTER TABLE "Prescription" DROP COLUMN "medicationId",
ADD COLUMN     "medicineId" TEXT;

-- DropTable
DROP TABLE "Medication";

-- CreateTable
CREATE TABLE "medicines" (
    "id" TEXT NOT NULL,
    "genericName" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dosageForms" TEXT[],
    "strengths" TEXT[],
    "manufacturer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "medicines_genericName_idx" ON "medicines"("genericName");

-- CreateIndex
CREATE INDEX "medicines_brandName_idx" ON "medicines"("brandName");

-- CreateIndex
CREATE INDEX "medicines_category_idx" ON "medicines"("category");

-- CreateIndex
CREATE INDEX "Prescription_medicineId_idx" ON "Prescription"("medicineId");

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "medicines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
