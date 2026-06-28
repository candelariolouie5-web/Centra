import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseDateOnly(dateInput: string) {
  const [year, month, day] = dateInput.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const appointmentId = params.id;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const { appointmentDate, appointmentTime } = body;

    if (!appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: "appointmentDate and appointmentTime are required" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        appointmentDate: parseDateOnly(appointmentDate),
        appointmentTime,
        secretaryStatus: "RESCHEDULED",
        rescheduledAt: new Date(),
      },
      include: {
        patient: true,
        secretaryVitals: true,
        secretaryFollowUps: true,
        secretaryProcedures: true,
      },
    });

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Secretary reschedule PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to reschedule appointment" },
      { status: 500 }
    );
  }
}