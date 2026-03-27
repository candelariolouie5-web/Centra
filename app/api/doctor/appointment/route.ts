import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/* ===============================
   DOCTOR → VIEW OWN ASSIGNED APPOINTMENTS ONLY
================================ */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isActive: true },
    });

    if (!doctor || doctor.role !== "DOCTOR" || !doctor.isActive) {
      return NextResponse.json(
        { error: "Forbidden: Active doctor only" },
        { status: 403 }
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        assignedToUserId: session.user.id,
      },
      orderBy: [
        { appointmentDate: "asc" },
        { appointmentTime: "asc" },
      ],
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
   DOCTOR → CANCEL OWN ASSIGNED APPOINTMENT ONLY
================================ */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isActive: true },
    });

    if (!doctor || doctor.role !== "DOCTOR" || !doctor.isActive) {
      return NextResponse.json(
        { error: "Forbidden: Active doctor only" },
        { status: 403 }
      );
    }

    const { id, status } = await request.json();

    if (!id || status !== "CANCELLED") {
      return NextResponse.json(
        { error: "Valid ID and status='CANCELLED' required" },
        { status: 400 }
      );
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id,
        assignedToUserId: session.user.id,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Appointment not found or not assigned to you" },
        { status: 404 }
      );
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
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