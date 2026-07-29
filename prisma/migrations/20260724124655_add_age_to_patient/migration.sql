-- AddForeignKey
ALTER TABLE "ClinicalFinding" ADD CONSTRAINT "ClinicalFinding_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
