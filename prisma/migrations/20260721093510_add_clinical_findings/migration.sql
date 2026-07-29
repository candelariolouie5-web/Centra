-- CreateTable
CREATE TABLE "ClinicalFinding" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "anatomy" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "impression" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicalFinding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClinicalFinding_patientId_idx" ON "ClinicalFinding"("patientId");

-- CreateIndex
CREATE INDEX "ClinicalFinding_anatomy_idx" ON "ClinicalFinding"("anatomy");

-- CreateIndex
CREATE INDEX "ClinicalFinding_diagnosis_idx" ON "ClinicalFinding"("diagnosis");
