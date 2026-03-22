import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const {
      patientId,
      chiefComplaint,
      historyOfIllness,
      remarks,
      diagnosis,
      plan,
      followUp,
      prescriptions,
    } = await request.json();

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    // Check if patient exists
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, role: true },
    });

    if (!patient || patient.role !== "USER") {
      return NextResponse.json({ error: "Invalid patient" }, { status: 400 });
    }

    // Check if a SOAP note already exists for this patient
    const existingSoapNote = await prisma.soapNote.findFirst({
      where: { patientId },
      orderBy: { createdAt: "desc" },
    });

    let soapNote;
    if (existingSoapNote) {
      // Update the existing SOAP note
      soapNote = await prisma.soapNote.update({
        where: { id: existingSoapNote.id },
        data: {
          chiefComplaint,
          historyOfIllness,
          remarks,
          diagnosis,
          plan,
          followUp,
        },
      });
    } else {
      // Create a new SOAP note
      soapNote = await prisma.soapNote.create({
        data: {
          patientId,
          chiefComplaint,
          historyOfIllness,
          remarks,
          diagnosis,
          plan,
          followUp,
        },
      });
    }

    // Create prescriptions if provided
    if (prescriptions && Array.isArray(prescriptions)) {
      await prisma.prescription.createMany({
        data: prescriptions.map((rx: any) => ({
          soapNoteId: soapNote.id,
          drug: rx.drug,
          dose: rx.dose,
          frequency: rx.frequency,
          duration: rx.duration,
          instructions: rx.instructions,
        })),
      });
    }

    return NextResponse.json({ message: "SOAP note saved successfully", soapNote });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save SOAP note" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");

  if (!patientId) {
    return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
  }

  try {
    // Get SOAP notes for the patient
    const soapNotes = await prisma.soapNote.findMany({
      where: { patientId },
      include: {
        prescriptionsList: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ soapNotes });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch SOAP notes" }, { status: 500 });
  }
}
