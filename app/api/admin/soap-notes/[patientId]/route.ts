import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
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

  const { patientId } = await params;

  if (!patientId) {
    return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
  }

  try {
    const { chiefComplaint, remarks, historyOfIllness } = await request.json();

    // Check if patient exists
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, role: true },
    });

    if (!patient || patient.role !== "USER") {
      return NextResponse.json({ error: "Invalid patient" }, { status: 400 });
    }

    // Get the latest SOAP note for the patient
    const existingSoapNote = await prisma.soapNote.findFirst({
      where: { patientId },
      orderBy: { createdAt: "desc" },
    });

    let soapNote;
    if (existingSoapNote) {
      // Update existing SOAP note
      soapNote = await prisma.soapNote.update({
        where: { id: existingSoapNote.id },
        data: {
          chiefComplaint: chiefComplaint || null,
          remarks: remarks || null,
          historyOfIllness: historyOfIllness || null,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new SOAP note
      soapNote = await prisma.soapNote.create({
        data: {
          patientId,
          chiefComplaint: chiefComplaint || null,
          remarks: remarks || null,
          historyOfIllness: historyOfIllness || null,
        },
      });
    }

    return NextResponse.json({ message: "SOAP note updated successfully", soapNote });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update SOAP note" }, { status: 500 });
  }
}
