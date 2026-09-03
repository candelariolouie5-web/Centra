import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!["ADMIN", "DOCTOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { patientId, generic, brandName, quantity, dosage, instructions } = body;

    if (!patientId || !generic?.trim()) {
      return NextResponse.json(
        { error: "Patient ID and generic name are required" },
        { status: 400 }
      );
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true },
    });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find or create medicine (model name is 'medicine' in Prisma)
      let medicine = await tx.medicine.findFirst({
        where: {
          generic: generic.trim(),
          brandName: brandName?.trim() || null,
        },
      });
      if (!medicine) {
        medicine = await tx.medicine.create({
          data: {
            generic: generic.trim(),
            brandName: brandName?.trim() || null,
            quantity: quantity?.trim() || null,
            dosage: dosage?.trim() || null,
            instructions: instructions?.trim() || null,
          },
        });
      }

      // Create SOAP note
      const soapNote = await tx.soapNote.create({
        data: {
          patientId,
          chiefComplaint: "Prescription only",
          doctorId: session.user.id,
        },
      });

      // Create prescription – copy fields from medicine, no foreign key
      const prescription = await tx.prescription.create({
        data: {
          soapNoteId: soapNote.id,
          generic: medicine.generic,
          brandName: medicine.brandName,
          quantity: medicine.quantity,
          dosage: medicine.dosage,
          instructions: medicine.instructions,
        },
      });

      return prescription;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[PRESCRIPTION-POST]", error);
    return NextResponse.json(
      { error: "Failed to save prescription" },
      { status: 500 }
    );
  }
}