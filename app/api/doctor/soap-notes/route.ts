import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

type PrescriptionInput = {
  medicationId?: string | null;
  generic?: string | null;
  brandName?: string | null;
  quantity?: string | null;
  dosage?: string | null;
  instructions?: string | null;
};

type SoapNoteRequestBody = {
  patientId?: string;
  chiefComplaint?: string | null;
  historyOfIllness?: string | null;
  remarks?: string | null;
  diagnosis?: string | null;
  plan?: string | null;
  followUp?: string | null;
  imageData?: string | null;
  prescriptions?: PrescriptionInput[];
};

function normalizeText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeNullableText(value: unknown) {
  const normalized = normalizeText(value);
  return normalized || null;
}

function normalizePrescription(rx: PrescriptionInput) {
  return {
    medicationId:
      typeof rx?.medicationId === "string" && rx.medicationId.trim()
        ? rx.medicationId.trim()
        : null,
    generic: normalizeText(rx?.generic),
    brandName: normalizeText(rx?.brandName),
    quantity: normalizeText(rx?.quantity),
    dosage: normalizeText(rx?.dosage),
    instructions: normalizeText(rx?.instructions),
  };
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "DOCTOR") {
    return NextResponse.json(
      { error: "Forbidden: Doctor role required" },
      { status: 403 }
    );
  }

  const doctorId = user.id;
  let requestBody: SoapNoteRequestBody | null = null;

  try {
    console.log("[DOCTOR-SOAP-REQUEST]", {
      url: request.url,
      method: request.method,
    });

    requestBody = (await request.json()) as SoapNoteRequestBody;

    console.log("[DOCTOR-SOAP-BODY]", {
      patientId: requestBody?.patientId,
      hasPrescriptions: !!requestBody?.prescriptions?.length,
      fields: Object.keys(requestBody || {}).filter(
        (key) => key !== "prescriptions"
      ),
    });

    const patientId = normalizeText(requestBody?.patientId);

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const patientWithScope = await prisma.patient.findFirst({
      where: {
        id: patientId,
        appointments: {
          some: {
            assignedToUserId: doctorId,
            status: {
              in: ["PENDING", "CONFIRMED", "ACCEPTED"],
            },
          },
        },
      },
      select: { id: true },
    });

    if (!patientWithScope) {
      return NextResponse.json(
        {
          error: `Patient not found or not assigned to you: ${patientId}`,
        },
        { status: 403 }
      );
    }

    const rawPrescriptions = Array.isArray(requestBody?.prescriptions)
      ? requestBody!.prescriptions!
      : [];

    const normalizedPrescriptions = rawPrescriptions
      .map(normalizePrescription)
      .filter((rx) => rx.generic.length > 0);

    const requestedMedicationIds = normalizedPrescriptions
      .map((rx) => rx.medicationId)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    let validMedicationIds = new Set<string>();

    if (requestedMedicationIds.length > 0) {
      const medications = await prisma.medication.findMany({
        where: {
          id: {
            in: requestedMedicationIds,
          },
        },
        select: { id: true },
      });

      validMedicationIds = new Set(medications.map((med) => med.id));
    }

    const soapNotePayload = {
      chiefComplaint: normalizeNullableText(requestBody?.chiefComplaint),
      historyOfIllness: normalizeNullableText(requestBody?.historyOfIllness),
      remarks: normalizeNullableText(requestBody?.remarks),
      diagnosis: normalizeNullableText(requestBody?.diagnosis),
      plan: normalizeNullableText(requestBody?.plan),
      followUp: normalizeNullableText(requestBody?.followUp),
      imageData: normalizeNullableText(requestBody?.imageData),
      prescriptions: normalizedPrescriptions,
    };

    const existingSoapNote = await prisma.soapNote.findFirst({
      where: { patientId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    const soapNote = await prisma.$transaction(async (tx) => {
      let savedSoapNote:
        | {
            id: string;
          }
        | undefined;

      if (existingSoapNote) {
        savedSoapNote = await tx.soapNote.update({
          where: { id: existingSoapNote.id },
          data: soapNotePayload,
          select: { id: true },
        });

        await tx.prescription.deleteMany({
          where: { soapNoteId: existingSoapNote.id },
        });
      } else {
        savedSoapNote = await tx.soapNote.create({
          data: {
            patientId,
            ...soapNotePayload,
          },
          select: { id: true },
        });
      }

      if (normalizedPrescriptions.length > 0) {
        await tx.prescription.createMany({
          data: normalizedPrescriptions.map((rx) => ({
            soapNoteId: savedSoapNote.id,
            medicationId:
              rx.medicationId && validMedicationIds.has(rx.medicationId)
                ? rx.medicationId
                : null,
            generic: rx.generic,
            brandName: rx.brandName,
            quantity: rx.quantity,
            dosage: rx.dosage,
            instructions: rx.instructions,
          })),
        });
      }

      return savedSoapNote;
    });

    return NextResponse.json({
      message: "SOAP note saved successfully",
      soapNoteId: soapNote.id,
    });
  } catch (error: any) {
    console.error("[DOCTOR-SOAP-NOTE-ERROR]", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      patientId: requestBody?.patientId,
      sessionUser: session.user?.email,
    });

    let errorMessage = "Failed to save SOAP note";

    if (error?.code === "P2002") {
      errorMessage =
        "Database constraint violation - data already exists or invalid";
    } else if (typeof error?.code === "string" && error.code.startsWith("P20")) {
      errorMessage = `Database error: ${error.message}`;
    } else if (typeof error?.message === "string" && error.message.includes("prisma")) {
      errorMessage = "Database operation failed";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "DOCTOR") {
    return NextResponse.json(
      { error: "Forbidden: Doctor role required" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const patientId = normalizeText(searchParams.get("patientId"));

  if (!patientId) {
    return NextResponse.json(
      { error: "Patient ID is required" },
      { status: 400 }
    );
  }

  try {
    const doctorScopePatient = await prisma.patient.findFirst({
      where: {
        id: patientId,
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

    if (!doctorScopePatient) {
      return NextResponse.json(
        {
          error: `Patient not assigned to you: ${patientId}`,
        },
        { status: 403 }
      );
    }

    const soapNotes = await prisma.soapNote.findMany({
      where: { patientId },
      include: {
        prescriptionsList: {
          include: {
            medication: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const normalizedSoapNotes = soapNotes.map((note) => ({
      ...note,
      prescriptions: note.prescriptionsList.map((rx) => ({
        id: rx.id,
        medicationId: rx.medicationId,
        generic: rx.generic,
        brandName: rx.brandName,
        quantity: rx.quantity,
        dosage: rx.dosage,
        instructions: rx.instructions,
        createdAt: rx.createdAt,
      })),
    }));

    return NextResponse.json({ soapNotes: normalizedSoapNotes });
  } catch (error) {
    console.error("[DOCTOR-SOAP-NOTE-GET-ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch SOAP notes" },
      { status: 500 }
    );
  }
}