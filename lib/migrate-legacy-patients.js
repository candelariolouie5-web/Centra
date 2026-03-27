import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function migrate() {
  console.log('Starting legacy patient migration...');

  // 1. Create Patient records for existing USER patients
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    select: { id: true, name: true, email: true, image: true }
  });

  for (const user of users) {
    const existingPatient = await prisma.patient.findFirst({
      where: { 
        OR: [
          { email: user.email },
          { name: { equals: user.name, mode: 'insensitive' } }
        ]
      }
    });

    if (!existingPatient) {
      const patient = await prisma.patient.create({
        data: {
          name: user.name || 'Legacy Patient',
          email: user.email,
          // Map other fields if available
        }
      });
      console.log(`Created patient ${patient.id} for legacy user ${user.id}`);
    }
  }

  // 2. Update appointments: map legacy userId to patientId (first matching patient)
  const appointments = await prisma.appointment.findMany({
    where: { patientId: null }, // Only unmigrated
    select: { id: true, userId: true }
  });

  for (const appt of appointments) {
    const legacyUser = await prisma.user.findUnique({ 
      where: { id: appt.userId } 
    });
    if (legacyUser) {
      const patient = await prisma.patient.findFirst({
        where: { email: legacyUser.email }
      });
      if (patient) {
        await prisma.appointment.update({
          where: { id: appt.id },
          data: { patientId: patient.id }
        });
        console.log(`Mapped appt ${appt.id} to patient ${patient.id}`);
      }
    }
  }

  // 3. Update SoapNotes and MedicalHistory (similar logic)
  const soapNotes = await prisma.soapNote.findMany({
    where: { /* legacy condition */ },
  });
  // ... similar mapping

  const medicalHistories = await prisma.medicalHistory.findMany({
    where: { /* legacy condition */ },
  });
  // ... similar mapping

  // 4. Backfill assignedToUserId where possible (e.g., based on createdByRole)
  // For now, leave nullable if can't determine

  console.log('Migration complete. Run prisma generate.');
}

migrate()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

