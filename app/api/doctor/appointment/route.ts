import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/* ===============================
   DOCTOR → VIEW ONLY OWN DOCTOR-ASSIGNED APPOINTMENTS
================================ */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, isActive: true },
    });

    if (!doctor || doctor.role !== "DOCTOR" || !doctor.isActive) {
      return NextResponse.json(
        { error: "Forbidden: Active doctor only" },
        { status: 403 }
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        assignedToRole: "DOCTOR",
        assignedToUserId: doctor.id,
      },
      orderBy: [{ appointmentDate: "asc" }, { appointmentTime: "asc" }],
    });

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    console.error("[DOCTOR APPOINTMENTS GET ERROR]", error);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/* ===============================
   DOCTOR → CREATE FOLLOW-UP / APPOINTMENT
================================ */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, isActive: true },
    });

    if (!doctor || doctor.role !== "DOCTOR" || !doctor.isActive) {
      return NextResponse.json(
        { error: "Forbidden: Active doctor only" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      patientId,
      fullName,
      email,
      age,
      contactNumber,
      appointmentDate,
      appointmentTime,
      serviceType,
      room,
      source,
    } = body;

    if (!patientId || !appointmentDate || !appointmentTime || !serviceType) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: patientId, appointmentDate, appointmentTime, serviceType",
        },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        phone: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patient: {
          connect: { id: patient.id },
        },
        fullName: fullName || patient.name || "N/A",
        email: email || patient.email || null,
        age: typeof age === "number" ? age : patient.age ?? null,
        contactNumber: contactNumber || patient.phone || "",
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        serviceType,
        status: "CONFIRMED",
        room: room || null,
        source: source || "staff",
        assignedToRole: "DOCTOR",
        assignedToUserId: doctor.id,
      },
    });

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (error) {
    console.error("[DOCTOR APPOINTMENT POST ERROR]", error);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/* ===============================
   DOCTOR → CANCEL / REJECT ONLY OWN DOCTOR-ASSIGNED APPOINTMENT
================================ */
function isValidStatusTransition(current: string, next: string): boolean {
  if (["CANCELLED", "REJECTED"].includes(current)) return false;

  if (["CANCELLED", "REJECTED"].includes(next)) {
    return ["PENDING", "CONFIRMED", "ACCEPTED"].includes(current);
  }

  return current !== next && ["PENDING"].includes(current) && next === "CONFIRMED";
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, isActive: true },
    });

    if (!doctor || doctor.role !== "DOCTOR" || !doctor.isActive) {
      return NextResponse.json(
        { error: "Forbidden: Active doctor only" },
        { status: 403 }
      );
    }

    const { id, status } = await request.json();

    if (!id || !["CANCELLED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Valid ID and status='CANCELLED' or 'REJECTED' required" },
        { status: 400 }
      );
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id,
        assignedToRole: "DOCTOR",
        assignedToUserId: doctor.id,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Appointment not found or not assigned to you" },
        { status: 404 }
      );
    }

    const isValidTransition = isValidStatusTransition(
      existingAppointment.status,
      status
    );

    if (!isValidTransition) {
      return NextResponse.json(
        {
          error: `Invalid status transition: ${existingAppointment.status} → ${status}`,
        },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, appointment }, { status: 200 });
  } catch (error) {
    console.error("[DOCTOR APPOINTMENT PATCH ERROR]", error);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}