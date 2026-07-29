import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export const BUSY_APPOINTMENT_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "ACCEPTED",
] as const;

export type StaffAssignmentRole = "ADMIN" | "DOCTOR";

type DbClient = any;

export function getDayRange(dateInput: string | Date) {
  if (typeof dateInput === "string") {
    const [year, month, day] = dateInput.split("-").map(Number);
    const start = new Date(year, month - 1, day, 0, 0, 0, 0);
    const end = new Date(year, month - 1, day, 23, 59, 59, 999);
    return { start, end };
  }

  const start = new Date(dateInput);
  start.setHours(0, 0, 0, 0);

  const end = new Date(dateInput);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function isEligibleActiveStaff(user: any) {
  if (!user) return false;

  if (typeof user.isActive === "boolean") return user.isActive;
  if (typeof user.active === "boolean") return user.active;
  if (typeof user.status === "string") {
    return user.status.toUpperCase() === "ACTIVE";
  }

  return true;
}

async function getBlockedStateForDate(
  dateInput: string | Date,
  db: DbClient = prisma
) {
  const { start, end } = getDayRange(dateInput);

  const blockedRows = await db.blockedDate.findMany({
    where: {
      startDate: { lte: end },
      endDate: { gte: start },
    },
    select: {
      doctorId: true,
    },
  });

  const adminBlocked = blockedRows.some((row: any) => !row.doctorId);

  const blockedDoctorIds = new Set<string>();
  for (const row of blockedRows) {
    if (row.doctorId) {
      blockedDoctorIds.add(row.doctorId);
    }
  }

  return {
    adminBlocked,
    blockedDoctorIds,
  };
}

export async function getEligibleStaffByRole(
  role: StaffAssignmentRole,
  db: DbClient = prisma,
  dateInput?: string | Date
) {
  const users = await db.user.findMany({
    where: { role },
    orderBy: [{ createdAt: "asc" }, { name: "asc" }, { email: "asc" }],
  });

  const eligibleUsers = users.filter(isEligibleActiveStaff);

  if (!dateInput) {
    return eligibleUsers;
  }

  // @ts-ignore
  const blockedState = await getBlockedStateForDate(dateInput, db);

  if (role === "ADMIN") {
    return blockedState.adminBlocked ? [] : eligibleUsers;
  }

  return eligibleUsers.filter(
    (user: any) => !blockedState.blockedDoctorIds.has(user.id)
  );
}

export async function getBusyAssignedUserIdsForSlot(
  dateInput: string | Date,
  time: string,
  db: DbClient = prisma
) {
  const { start, end } = getDayRange(dateInput);

  const rows = await db.appointment.findMany({
    where: {
      appointmentDate: {
        gte: start,
        lte: end,
      },
      appointmentTime: time,
      status: {
        in: [...BUSY_APPOINTMENT_STATUSES],
      },
      assignedToUserId: {
        not: null,
      },
    },
    select: {
      assignedToUserId: true,
    },
  });

  return new Set(
    rows
      .map((row: any) => row.assignedToUserId)
      .filter((id: string | null): id is string => Boolean(id))
  );
}

export async function findFirstFreeAssigneeForSlot(
  dateInput: string | Date,
  time: string,
  db: DbClient = prisma
): Promise<{
  assignedToRole: StaffAssignmentRole;
  assignedToUserId: string;
} | null> {
  const busyAssignedUserIds = await getBusyAssignedUserIdsForSlot(
    dateInput,
    time,
    db
  );

  const admins = await getEligibleStaffByRole("ADMIN", db, dateInput);
  const freeAdmin = admins.find(
    (user: any) => !busyAssignedUserIds.has(user.id)
  );

  if (freeAdmin) {
    return {
      assignedToRole: "ADMIN",
      assignedToUserId: freeAdmin.id,
    };
  }

  const doctors = await getEligibleStaffByRole("DOCTOR", db, dateInput);
  const freeDoctor = doctors.find(
    (user: any) => !busyAssignedUserIds.has(user.id)
  );

  if (freeDoctor) {
    return {
      assignedToRole: "DOCTOR",
      assignedToUserId: freeDoctor.id,
    };
  }

  return null;
}

export async function getAvailabilityForSlot(
  dateInput: string | Date,
  time: string,
  db: DbClient = prisma
) {
  const [admins, doctors, busyAssignedUserIds] = await Promise.all([
    getEligibleStaffByRole("ADMIN", db, dateInput),
    getEligibleStaffByRole("DOCTOR", db, dateInput),
    getBusyAssignedUserIdsForSlot(dateInput, time, db),
  ]);

  const eligibleUserIds = new Set<string>([
    ...admins.map((u: any) => u.id),
    ...doctors.map((u: any) => u.id),
  ]);

  const occupied = [...busyAssignedUserIds].filter((id) =>
    eligibleUserIds.has(id)
  ).length;

  const capacity = eligibleUserIds.size;
  const remaining = Math.max(0, capacity - occupied);
  const isFull = capacity <= 0 || remaining <= 0;

  return {
    capacity,
    occupied,
    remaining,
    isFull,
  };
}

export async function getActiveDoctorCount(dateInput?: string | Date) {
  const doctors = await getEligibleStaffByRole("DOCTOR", prisma, dateInput);
  return doctors.length;
}

export async function getActiveAdminCount(dateInput?: string | Date) {
  const admins = await getEligibleStaffByRole("ADMIN", prisma, dateInput);
  return admins.length;
}

export async function getActiveStaffCount(dateInput?: string | Date) {
  const [admins, doctors] = await Promise.all([
    getEligibleStaffByRole("ADMIN", prisma, dateInput),
    getEligibleStaffByRole("DOCTOR", prisma, dateInput),
  ]);

  return admins.length + doctors.length;
}

export async function getFirstAvailableAdminId(
  appointmentDate: Date,
  appointmentTime: string
): Promise<string | null> {
  const assignee = await findFirstFreeAssigneeForSlot(
    appointmentDate,
    appointmentTime
  );

  if (!assignee || assignee.assignedToRole !== "ADMIN") {
    return null;
  }

  return assignee.assignedToUserId;
}

export async function getFirstAvailableDoctorId(
  appointmentDate: Date,
  appointmentTime: string
): Promise<string | null> {
  const busyAssignedUserIds = await getBusyAssignedUserIdsForSlot(
    appointmentDate,
    appointmentTime
  );

  const doctors = await getEligibleStaffByRole(
    "DOCTOR",
    prisma,
    appointmentDate
  );
  const freeDoctor = doctors.find(
    (user: any) => !busyAssignedUserIds.has(user.id)
  );

  return freeDoctor?.id ?? null;
}

export async function getSlotCapacity(
  exactDate: Date | string,
  time: string
): Promise<{
  capacity: number;
  occupied: number;
  remaining: number;
  isFull: boolean;
}> {
  return getAvailabilityForSlot(exactDate, time);
}

export async function canDeactivateDoctor(
  force: boolean = false
): Promise<{ ok: boolean; error?: string }> {
  if (force) {
    console.warn("Force deactivating doctor - bypassing capacity check");
    return { ok: true };
  }

  const currentActiveDoctors = await getActiveDoctorCount();
  const currentActiveAdmins = await getActiveAdminCount();

  const newDoctorCount = Math.max(0, currentActiveDoctors - 1);
  const newCapacity = currentActiveAdmins + newDoctorCount;

  const futureBookings = await prisma.appointment.groupBy({
    by: ["appointmentDate", "appointmentTime"],
    where: {
      status: {
        in: [...BUSY_APPOINTMENT_STATUSES],
      },
      appointmentDate: {
        gt: new Date(),
      },
      assignedToUserId: {
        not: null,
      },
    },
    _count: {
      id: true,
    },
  });

  const overloadedSlot = futureBookings.find(
    (group) => (group._count.id ?? 0) > newCapacity
  );

  if (overloadedSlot) {
    const dateStr = new Date(overloadedSlot.appointmentDate)
      .toISOString()
      .split("T")[0];

    return {
      ok: false,
      error: `Cannot deactivate: bookings exceed new capacity on ${dateStr} ${overloadedSlot.appointmentTime} (${overloadedSlot._count.id}/${newCapacity})`,
    };
  }

  return { ok: true };
}