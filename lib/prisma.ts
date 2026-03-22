import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function getActiveDoctorCount() {
  return prisma.user.count({
    where: {
      role: "DOCTOR",
      isActive: true
    }
  });
}

export async function canDeactivateDoctor(force: boolean = false): Promise<{ ok: boolean; error?: string }> {
  if (force) {
    console.warn('Force deactivating doctor - bypassing capacity check');
    return { ok: true };
  }
  
  const currentActive = await getActiveDoctorCount();
  // Removed last doctor protection - now relies on capacity check only
  
  const newCapacity = Math.max(1, currentActive - 1);
  const futureBookings = await prisma.appointment.groupBy({
    by: ['appointmentDate', 'appointmentTime'],
    where: {
      status: { in: ['PENDING', 'CONFIRMED'] },
      appointmentDate: { gt: new Date() }
    },
    _count: { id: true }
  });
  
  const overloadedSlot = futureBookings.find(group => (group._count.id ?? 0) > newCapacity);
  if (overloadedSlot) {
    const dateStr = overloadedSlot.appointmentDate.toISOString().split('T')[0];
    return { 
      ok: false, 
      error: `Cannot deactivate: bookings exceed new capacity on ${dateStr} ${overloadedSlot.appointmentTime} (${overloadedSlot._count.id}/${newCapacity})` 
    };
  }
  return { ok: true };
}

