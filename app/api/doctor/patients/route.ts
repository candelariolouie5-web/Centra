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
      select: { id: true, role: true },
    });

    if (!user || user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Forbidden: Doctor only" }, { status: 403 });
    }

    const doctorId = user.id;

    const appointments = await prisma.appointment.findMany({
      where: {
        assignedToRole: "DOCTOR",
        assignedToUserId: doctorId,
        status: {
          in: ["PENDING", "CONFIRMED", "ACCEPTED"],
        },
        patientId: {
          not: null,
        },
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

    const latestPerPatient = new Map<string, (typeof appointments)[number]>();

    for (const appointment of appointments) {
      if (!appointment.patientId || !appointment.patient) continue;

      if (!latestPerPatient.has(appointment.patientId)) {
        latestPerPatient.set(appointment.patientId, appointment);
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
      };
    });

    return NextResponse.json({ patients: transformedPatients }, { status: 200 });
  } catch (error) {
    console.error("Doctor patients GET error:", error);
    return NextResponse.json({ patients: [] }, { status: 200 });
  }
}