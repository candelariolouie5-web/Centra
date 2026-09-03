/*
  Warnings:

  - You are about to drop the column `medicineId` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `medicines` table. All the data in the column will be lost.
  - You are about to drop the column `dosageForms` on the `medicines` table. All the data in the column will be lost.
  - You are about to drop the column `genericName` on the `medicines` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `medicines` table. All the data in the column will be lost.
  - You are about to drop the column `strengths` on the `medicines` table. All the data in the column will be lost.
  - Added the required column `generic` to the `medicines` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_medicineId_fkey";

-- DropIndex
DROP INDEX "Prescription_medicineId_idx";

-- DropIndex
DROP INDEX "medicines_category_idx";

-- DropIndex
DROP INDEX "medicines_genericName_idx";

-- AlterTable
ALTER TABLE "Prescription" DROP COLUMN "medicineId";

-- AlterTable
ALTER TABLE "medicines" DROP COLUMN "category",
DROP COLUMN "dosageForms",
DROP COLUMN "genericName",
DROP COLUMN "manufacturer",
DROP COLUMN "strengths",
ADD COLUMN     "dosage" TEXT,
ADD COLUMN     "generic" TEXT NOT NULL,
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "quantity" TEXT,
ALTER COLUMN "brandName" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "medicines_generic_idx" ON "medicines"("generic");
