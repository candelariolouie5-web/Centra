import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

async function resolvePatientId(rawPatientId: string) {
  if (!rawPatientId) return null;

  const patient = await prisma.patient.findUnique({
    where: { id: rawPatientId },
    select: { id: true },
  });

  if (patient?.id) return patient.id;

  const appointment = await prisma.appointment.findUnique({
    where: { id: rawPatientId },
    select: { patientId: true },
  });

  return appointment?.patientId ?? null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user || !["ADMIN", "DOCTOR"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { patientId } = await params;

  if (!patientId) {
    return NextResponse.json(
      { error: "Patient ID is required" },
      { status: 400 }
    );
  }

  try {
    const resolvedPatientId = await resolvePatientId(patientId);

    if (!resolvedPatientId) {
      return NextResponse.json({ error: "Invalid patient" }, { status: 400 });
    }

    if (user.role === "DOCTOR") {
      const assignedPatient = await prisma.patient.findFirst({
        where: {
          id: resolvedPatientId,
          appointments: {
            some: {
              assignedToUserId: user.id,
              status: {
                in: ["PENDING", "CONFIRMED", "ACCEPTED"],
              },
            },
          },
        },
        select: { id: true },
      });

      if (!assignedPatient) {
        return NextResponse.json(
          { error: "Patient not assigned to this doctor" },
          { status: 403 }
        );
      }
    }

    const patient = await prisma.patient.findUnique({
      where: { id: resolvedPatientId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        age: true,
        gender: true,
        address: true,
        createdAt: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const latestSoapNote = await prisma.soapNote.findFirst({
      where: { patientId: resolvedPatientId },
      orderBy: { createdAt: "desc" },
      include: {
        prescriptionsList: {
          include: {
            medication: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const medicalHistories = await prisma.medicalHistory.findMany({
      where: { patientId: resolvedPatientId },
      orderBy: { resultDate: "desc" },
    });

    const prescriptionRecords = latestSoapNote?.prescriptionsList || [];

    const jsonPrescriptions = Array.isArray(latestSoapNote?.prescriptions)
      ? latestSoapNote?.prescriptions
      : [];

    const prescriptions =
      prescriptionRecords.length > 0 ? prescriptionRecords : jsonPrescriptions;

    return NextResponse.json({
      patient,
      latestSoapNote,
      prescriptions,
      medicalHistories,
    });
  } catch (error) {
    console.error("[REPORT_GET]", error);

    return NextResponse.json(
      { error: "Failed to load report data" },
      { status: 500 }
    );
  }
}