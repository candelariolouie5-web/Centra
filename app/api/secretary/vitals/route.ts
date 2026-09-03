import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      appointmentId,
      height,
      weight,
      bloodPressure,
      temperature,
      pulse,
      respiratoryRate,
      oxygenSaturation,
      notes,
      recordedBy,
    } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "appointmentId is required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const existingAppointment = await tx.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: true },
      });

      if (!existingAppointment) {
        throw new Error("Appointment not found");
      }

      let patientId = existingAppointment.patientId;

      if (!patientId) {
        const existingPatient = await tx.patient.findFirst({
          where: {
            OR: [
              { email: existingAppointment.email },
              { phone: existingAppointment.contactNumber || undefined },
            ],
          },
        });

        const patient =
          existingPatient ||
          (await tx.patient.create({
            data: {
              name: existingAppointment.fullName,
              email: existingAppointment.email || null,
              phone: existingAppointment.contactNumber || null,
              age: existingAppointment.age || null,
            },
          }));

        patientId = patient.id;

        await tx.appointment.update({
          where: { id: appointmentId },
          data: { patientId },
        });
      }

      const vitals = await tx.appointmentVitals.upsert({
        where: { appointmentId },
        update: {
          height: height || null,
          weight: weight || null,
          bloodPressure: bloodPressure || null,
          temperature: temperature || null,
          pulse: pulse || null,
          respiratoryRate: respiratoryRate || null,
          oxygenSaturation: oxygenSaturation || null,
          notes: notes || null,
          recordedBy: recordedBy || "SECRETARY",
        },
        create: {
          appointmentId,
          height: height || null,
          weight: weight || null,
          bloodPressure: bloodPressure || null,
          temperature: temperature || null,
          pulse: pulse || null,
          respiratoryRate: respiratoryRate || null,
          oxygenSaturation: oxygenSaturation || null,
          notes: notes || null,
          recordedBy: recordedBy || "SECRETARY",
        },
      });

      const appointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          patientId,
          secretaryStatus: "VITALS_RECORDED",
          vitalsRecordedAt: new Date(),
        },
        include: {
          patient: true,
          secretaryVitals: true,
          secretaryFollowUps: true,
          secretaryProcedures: true,
        },
      });

      return { vitals, appointment };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Secretary vitals POST error:", error);
    return NextResponse.json(
      { error: "Failed to save vitals" },
      { status: 500 }
    );
  }
}