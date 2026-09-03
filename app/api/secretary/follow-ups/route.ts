import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseDateOnly(dateInput: string) {
  const [year, month, day] = dateInput.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      appointmentId,
      appointmentDate,
      appointmentTime,
      service,
      notes,
    } = body;

    if (!appointmentId || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: "appointmentId, appointmentDate, and appointmentTime are required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const original = await tx.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!original) {
        throw new Error("Original appointment not found");
      }

      const followUpAppointment = await tx.appointment.create({
        data: {
          userId: original.userId,
          patientId: original.patientId,
          fullName: original.fullName,
          email: original.email,
          serviceType: service || "Follow-up Visit",
          appointmentDate: parseDateOnly(appointmentDate),
          appointmentTime,
          age: original.age,
          contactNumber: original.contactNumber,
          source: "SECRETARY_FOLLOW_UP",
          createdByRole: "SECRETARY",
          status: "CONFIRMED",
          secretaryStatus: "PENDING",
        },
      });

      const followUp = await tx.secretaryFollowUp.create({
        data: {
          appointmentId,
          newAppointmentId: followUpAppointment.id,
          patientName: original.fullName,
          contactNumber: original.contactNumber,
          service: service || "Follow-up Visit",
          appointmentDate: parseDateOnly(appointmentDate),
          appointmentTime,
          notes: notes || null,
        },
      });

      return { followUp, followUpAppointment };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Secretary follow-up POST error:", error);
    return NextResponse.json(
      { error: "Failed to schedule follow-up" },
      { status: 500 }
    );
  }
}