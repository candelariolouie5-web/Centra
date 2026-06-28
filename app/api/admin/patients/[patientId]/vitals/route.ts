import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getCurrentTimeLabel() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

async function getOrCreateLatestAppointment(patientId: string) {
  const latestAppointment = await prisma.appointment.findFirst({
    where: {
      patientId,
    },
    orderBy: [{ appointmentDate: "desc" }, { createdAt: "desc" }],
  });

  if (latestAppointment) return latestAppointment;

  const patient = await prisma.patient.findUnique({
    where: {
      id: patientId,
    },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  return prisma.appointment.create({
    data: {
      patientId,
      fullName: patient.name || "Patient",
      email: patient.email || "no-email@centraclinic.local",
      contactNumber: patient.phone || null,
      age: patient.age || null,
      serviceType: "Vitals Record",
      appointmentDate: new Date(),
      appointmentTime: getCurrentTimeLabel(),
      status: "CONFIRMED",
      secretaryStatus: "PENDING",
      source: "ADMIN",
      createdByRole: "ADMIN",
    },
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ patientId: string }> }
) {
  try {
    const params = await context.params;
    const patientId = params.patientId;

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const vitals = await prisma.appointmentVitals.findMany({
      where: {
        appointment: {
          patientId,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        appointment: {
          select: {
            id: true,
            fullName: true,
            serviceType: true,
            appointmentDate: true,
            appointmentTime: true,
            secretaryStatus: true,
          },
        },
      },
    });

    const latestAppointment = await prisma.appointment.findFirst({
      where: {
        patientId,
      },
      orderBy: [{ appointmentDate: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        fullName: true,
        serviceType: true,
        appointmentDate: true,
        appointmentTime: true,
        secretaryStatus: true,
      },
    });

    return NextResponse.json({
      vitals,
      latestAppointment,
    });
  } catch (error: any) {
    console.error("Admin patient vitals GET error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to fetch vitals",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ patientId: string }> }
) {
  try {
    const params = await context.params;
    const patientId = params.patientId;

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

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
    } = body;

    const appointment = appointmentId
      ? await prisma.appointment.findFirst({
          where: {
            id: appointmentId,
            patientId,
          },
        })
      : await getOrCreateLatestAppointment(patientId);

    const finalAppointment =
      appointment || (await getOrCreateLatestAppointment(patientId));

    const vitals = await prisma.appointmentVitals.upsert({
      where: {
        appointmentId: finalAppointment.id,
      },
      update: {
        height: height || null,
        weight: weight || null,
        bloodPressure: bloodPressure || null,
        temperature: temperature || null,
        pulse: pulse || null,
        respiratoryRate: respiratoryRate || null,
        oxygenSaturation: oxygenSaturation || null,
        notes: notes || null,
        recordedBy: "ADMIN",
      },
      create: {
        appointmentId: finalAppointment.id,
        height: height || null,
        weight: weight || null,
        bloodPressure: bloodPressure || null,
        temperature: temperature || null,
        pulse: pulse || null,
        respiratoryRate: respiratoryRate || null,
        oxygenSaturation: oxygenSaturation || null,
        notes: notes || null,
        recordedBy: "ADMIN",
      },
    });

    const updatedVitals = await prisma.appointmentVitals.findMany({
      where: {
        appointment: {
          patientId,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        appointment: {
          select: {
            id: true,
            fullName: true,
            serviceType: true,
            appointmentDate: true,
            appointmentTime: true,
            secretaryStatus: true,
          },
        },
      },
    });

    return NextResponse.json({
      vitals,
      allVitals: updatedVitals,
    });
  } catch (error: any) {
    console.error("Admin patient vitals POST error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to save vitals",
      },
      { status: 500 }
    );
  }
}