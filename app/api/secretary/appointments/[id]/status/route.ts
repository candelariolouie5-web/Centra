import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const statusTimestampMap: Record<string, string> = {
  VERIFIED: "verifiedAt",
  CHECKED_IN: "checkedInAt",
  VITALS_RECORDED: "vitalsRecordedAt",
  READY_FOR_DOCTOR: "readyForDoctorAt",
  COMPLETED: "completedAt",
  CANCELLED: "cancelledAt",
  RESCHEDULED: "rescheduledAt",
  SCHEDULED_FOR_PROCEDURE: "completedAt",
};

function getSharedAppointmentStatus(secretaryStatus?: string) {
  if (!secretaryStatus) return undefined;

  if (secretaryStatus === "CANCELLED") return "CANCELLED";

  return undefined;
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

    const {
      secretaryStatus,
      fullName,
      email,
      contactNumber,
      age,
      chiefComplaint,
      complaintNotes,
      procedureRequired,
    } = body;

    const data: any = {};

    if (secretaryStatus) {
      data.secretaryStatus = secretaryStatus;

      const sharedStatus = getSharedAppointmentStatus(secretaryStatus);

      if (sharedStatus) {
        data.status = sharedStatus;
      }

      const timestampField = statusTimestampMap[secretaryStatus];

      if (timestampField) {
        data[timestampField] = new Date();
      }
    }

    if (fullName !== undefined) data.fullName = fullName;
    if (email !== undefined) data.email = email;
    if (contactNumber !== undefined) data.contactNumber = contactNumber;
    if (age !== undefined) data.age = age === "" ? null : Number(age);
    if (chiefComplaint !== undefined) data.chiefComplaint = chiefComplaint;
    if (complaintNotes !== undefined) data.complaintNotes = complaintNotes;

    if (procedureRequired !== undefined) {
      data.procedureRequired = Boolean(procedureRequired);
    }

    const appointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data,
      include: {
        patient: true,
        secretaryVitals: true,
        secretaryFollowUps: true,
        secretaryProcedures: true,
      },
    });

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Secretary appointment status PATCH error:", error);

    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}