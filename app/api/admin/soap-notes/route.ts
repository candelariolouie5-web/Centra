import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

type PrescriptionInput = {
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
  diagnosticImages?: string[] | null;
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

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function normalizePrescription(rx: PrescriptionInput) {
  return {
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
    select: { role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Admin only for this endpoint" },
      { status: 403 }
    );
  }

  let requestBody: SoapNoteRequestBody | null = null;

  try {
    requestBody = (await request.json()) as SoapNoteRequestBody;

    const patientId = normalizeText(requestBody?.patientId);

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json(
        { error: `Patient not found: ${patientId}` },
        { status: 404 }
      );
    }

    const rawPrescriptions = Array.isArray(requestBody?.prescriptions)
      ? requestBody.prescriptions
      : [];

    const normalizedPrescriptions = rawPrescriptions
      .map(normalizePrescription)
      .filter((rx) => rx.generic.length > 0);

    const normalizedDiagnosticImages = normalizeStringArray(
      requestBody?.diagnosticImages
    );
    const fallbackSingleImage = normalizeNullableText(requestBody?.imageData);

    const finalDiagnosticImages =
      normalizedDiagnosticImages.length > 0
        ? normalizedDiagnosticImages
        : fallbackSingleImage
          ? [fallbackSingleImage]
          : [];

    // ✅ ALWAYS CREATE NEW SOAP NOTE (NO UPDATE)
    const soapNote = await prisma.$transaction(async (tx) => {
      // Create new SOAP note
      const newSoapNote = await tx.soapNote.create({
        data: {
          patientId,
          chiefComplaint: normalizeNullableText(requestBody?.chiefComplaint),
          historyOfIllness: normalizeNullableText(requestBody?.historyOfIllness),
          remarks: normalizeNullableText(requestBody?.remarks),
          diagnosis: normalizeNullableText(requestBody?.diagnosis),
          plan: normalizeNullableText(requestBody?.plan),
          followUp: normalizeNullableText(requestBody?.followUp),
          imageData: finalDiagnosticImages[0] ?? null,
          diagnosticImages: finalDiagnosticImages,
        },
        select: { id: true },
      });

      if (normalizedPrescriptions.length > 0) {
        await tx.prescription.createMany({
          data: normalizedPrescriptions.map((rx) => ({
            soapNoteId: newSoapNote.id,
            generic: rx.generic,
            brandName: rx.brandName,
            quantity: rx.quantity,
            dosage: rx.dosage,
            instructions: rx.instructions,
          })),
        });
      }

      return newSoapNote;
    });

    return NextResponse.json({
      message: "SOAP note saved successfully",
      soapNoteId: soapNote.id,
    });
  } catch (error: any) {
    console.error("[SOAP-NOTE-ERROR]", {
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
    } else if (
      typeof error?.message === "string" &&
      error.message.includes("prisma")
    ) {
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
    select: { role: true },
  });

  if (user?.role !== "ADMIN" && user?.role !== "DOCTOR") {
    return NextResponse.json(
      { error: "Forbidden: Admin or Doctor role required" },
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
    const soapNotes = await prisma.soapNote.findMany({
      where: { patientId },
      include: {
        prescriptionsList: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const normalizedSoapNotes = soapNotes.map((note) => ({
      ...note,
      diagnosticImages:
        Array.isArray(note.diagnosticImages) && note.diagnosticImages.length > 0
          ? note.diagnosticImages
          : note.imageData
            ? [note.imageData]
            : [],
      prescriptions: note.prescriptionsList.map((rx) => ({
        id: rx.id,
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
    console.error("[SOAP-NOTE-GET-ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch SOAP notes" },
      { status: 500 }
    );
  }
}