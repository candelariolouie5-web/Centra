/*
  Warnings:

  - You are about to drop the column `dose` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `drug` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `Prescription` table. All the data in the column will be lost.
  - Added the required column `generic` to the `Prescription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SecretaryAppointmentStatus" AS ENUM ('PENDING', 'VERIFIED', 'CHECKED_IN', 'VITALS_RECORDED', 'READY_FOR_DOCTOR', 'COMPLETED', 'SCHEDULED_FOR_PROCEDURE', 'NO_SHOW', 'CANCELLED', 'RESCHEDULED');

-- AlterEnum
ALTER TYPE "AppointmentAssignmentRole" ADD VALUE 'SECRETARY';

-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'COMPLETED';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SECRETARY';

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "checkedInAt" TIMESTAMP(3),
ADD COLUMN     "chiefComplaint" TEXT,
ADD COLUMN     "complaintNotes" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "lateArrival" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "noShowAt" TIMESTAMP(3),
ADD COLUMN     "procedureRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readyForDoctorAt" TIMESTAMP(3),
ADD COLUMN     "rescheduledAt" TIMESTAMP(3),
ADD COLUMN     "secretaryStatus" "SecretaryAppointmentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "vitalsRecordedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Prescription" DROP COLUMN "dose",
DROP COLUMN "drug",
DROP COLUMN "duration",
DROP COLUMN "frequency",
ADD COLUMN     "brandName" TEXT,
ADD COLUMN     "dosage" TEXT,
ADD COLUMN     "generic" TEXT NOT NULL,
ADD COLUMN     "medicationId" TEXT,
ADD COLUMN     "quantity" TEXT;

-- AlterTable
ALTER TABLE "SoapNote" ADD COLUMN     "diagnosticImages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "AppointmentVitals" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "height" TEXT,
    "weight" TEXT,
    "bloodPressure" TEXT,
    "temperature" TEXT,
    "pulse" TEXT,
    "respiratoryRate" TEXT,
    "oxygenSaturation" TEXT,
    "notes" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppointmentVitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecretaryFollowUp" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "newAppointmentId" TEXT,
    "patientName" TEXT NOT NULL,
    "contactNumber" TEXT,
    "service" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "appointmentTime" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecretaryFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecretaryProcedure" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "procedureType" TEXT NOT NULL,
    "room" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledTime" TEXT,
    "estimatedTime" TEXT,
    "doctor" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecretaryProcedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "generic" TEXT NOT NULL,
    "brandName" TEXT,
    "quantity" TEXT,
    "dosage" TEXT,
    "instructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentVitals_appointmentId_key" ON "AppointmentVitals"("appointmentId");

-- CreateIndex
CREATE INDEX "AppointmentVitals_appointmentId_idx" ON "AppointmentVitals"("appointmentId");

-- CreateIndex
CREATE INDEX "SecretaryFollowUp_appointmentId_idx" ON "SecretaryFollowUp"("appointmentId");

-- CreateIndex
CREATE INDEX "SecretaryFollowUp_appointmentDate_idx" ON "SecretaryFollowUp"("appointmentDate");

-- CreateIndex
CREATE INDEX "SecretaryProcedure_appointmentId_idx" ON "SecretaryProcedure"("appointmentId");

-- CreateIndex
CREATE INDEX "SecretaryProcedure_scheduledDate_idx" ON "SecretaryProcedure"("scheduledDate");

-- CreateIndex
CREATE INDEX "Medication_generic_idx" ON "Medication"("generic");

-- CreateIndex
CREATE INDEX "Medication_brandName_idx" ON "Medication"("brandName");

-- CreateIndex
CREATE INDEX "Appointment_secretaryStatus_idx" ON "Appointment"("secretaryStatus");

-- CreateIndex
CREATE INDEX "Prescription_soapNoteId_idx" ON "Prescription"("soapNoteId");

-- CreateIndex
CREATE INDEX "Prescription_medicationId_idx" ON "Prescription"("medicationId");

-- CreateIndex
CREATE INDEX "Prescription_generic_idx" ON "Prescription"("generic");

-- CreateIndex
CREATE INDEX "SoapNote_patientId_idx" ON "SoapNote"("patientId");

-- AddForeignKey
ALTER TABLE "AppointmentVitals" ADD CONSTRAINT "AppointmentVitals_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecretaryFollowUp" ADD CONSTRAINT "SecretaryFollowUp_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecretaryProcedure" ADD CONSTRAINT "SecretaryProcedure_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
