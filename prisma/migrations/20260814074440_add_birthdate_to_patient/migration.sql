-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "birthdate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "patients_birthdate_idx" ON "patients"("birthdate");
