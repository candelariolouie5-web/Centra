import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || user.role !== "DOCTOR" || !user.isActive) {
      return NextResponse.json({ error: "Forbidden: Doctor only" }, { status: 403 });
    }

    const doctorId = user.id;

    // Fetch ALL appointments assigned to this doctor (no status filter)
    const appointments = await prisma.appointment.findMany({
      where: {
        assignedToRole: "DOCTOR",
        assignedToUserId: doctorId,
        patientId: { not: null },
        // removed status filter to include CANCELLED, COMPLETED, etc.
      },
      include: {
        patient: {
          include: {
            soapNotes: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                id: true,
                chiefComplaint: true,
                historyOfIllness: true,
                remarks: true,
                diagnosis: true,
                plan: true,
                followUp: true,
                imageData: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: [{ appointmentDate: "desc" }, { createdAt: "desc" }],
    });

    // Deterministically pick the latest appointment per patient
    const sortedAppointments = [...appointments].sort((a, b) => {
      const aDate = a.appointmentDate instanceof Date ? a.appointmentDate : new Date(a.appointmentDate);
      const bDate = b.appointmentDate instanceof Date ? b.appointmentDate : new Date(b.appointmentDate);
      const diff = bDate.getTime() - aDate.getTime();
      if (diff !== 0) return diff;

      const aCreated = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const bCreated = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return bCreated.getTime() - aCreated.getTime();
    });

    const latestPerPatient = new Map<string, (typeof appointments)[number]>();
    for (const appointment of sortedAppointments) {
      if (!appointment.patientId || !appointment.patient) continue;
      if (!latestPerPatient.has(appointment.patientId)) {
        latestPerPatient.set(appointment.patientId, appointment);
      }
    }

    // Determine which patients have an appointment today (any status)
    const today = new Date();
    const todayY = today.getFullYear();
    const todayM = today.getMonth();
    const todayD = today.getDate();

    const hasTodayAppointment = new Set<string>();
    for (const a of appointments) {
      if (!a.patientId) continue;
      const d = a.appointmentDate instanceof Date ? a.appointmentDate : new Date(a.appointmentDate);
      if (d.getFullYear() === todayY && d.getMonth() === todayM && d.getDate() === todayD) {
        hasTodayAppointment.add(a.patientId);
      }
    }

    const transformedPatients = Array.from(latestPerPatient.values()).map((appt) => {
      const patient = appt.patient!;
      const latestSoapNote = patient.soapNotes?.[0] ?? null;

      return {
        id: patient.id,
        name: patient.name || appt.fullName || "N/A",
        email: patient.email || appt.email || null,
        image: null,
        createdAt: patient.createdAt.toISOString(),
        chiefComplaints: latestSoapNote?.chiefComplaint || null,
        remarks: latestSoapNote?.remarks || null,
        notes: latestSoapNote?.diagnosis || null,
        soapNote: latestSoapNote,

        latestAppointmentStatus: appt.status ?? null,
        hasTodayAppointment: hasTodayAppointment.has(patient.id),
      };
    });

    return NextResponse.json({ patients: transformedPatients });
  } catch (error) {
    console.error("Doctor patients GET error:", error);
    return NextResponse.json({ patients: [] }, { status: 200 });
  }
}