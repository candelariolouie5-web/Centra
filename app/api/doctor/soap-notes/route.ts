import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is doctor
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Forbidden: Doctor role required" }, { status: 403 });
  }

  const doctorId = user.id;

  try {
    console.log("[DOCTOR-SOAP-REQUEST]", { url: request.url, method: request.method });
    
    const body = await request.json();
    console.log("[DOCTOR-SOAP-BODY]", {
      patientId: body.patientId,
      hasPrescriptions: !!body.prescriptions?.length,
      fields: Object.keys(body).filter(k => !['prescriptions'].includes(k))
    });
    
    const {
      patientId,
      chiefComplaint,
      historyOfIllness,
      remarks,
      diagnosis,
      plan,
      followUp,
      imageData,
      prescriptions,
    } = body as any;

    // Explicit validation
    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }
    if (typeof patientId !== 'string' || patientId.length === 0) {
      return NextResponse.json({ error: "Patient ID must be a non-empty string" }, { status: 400 });
    }

    // Doctor scope: Patient must have appointment assigned to this doctor
    const patientWithScope = await prisma.patient.findFirst({
      where: {
        id: patientId,
        appointments: {
          some: {
            assignedToUserId: doctorId,
            status: {
              in: ["PENDING", "CONFIRMED", "ACCEPTED"]
            }
          }
        }
      },
      select: { id: true }
    });

    if (!patientWithScope) {
      return NextResponse.json({ 
        error: `Patient not found or not assigned to you: ${patientId}` 
      }, { status: 403 });
    }

    // Check if a SOAP note already exists for this patient (upsert logic)
    const existingSoapNote = await prisma.soapNote.findFirst({
      where: { patientId },
      orderBy: { createdAt: "desc" },
    });

    let soapNote: any;
    if (existingSoapNote) {
      // Update existing + handle prescriptions
      await prisma.$transaction(async (tx) => {
        // Delete old prescriptions
        await tx.prescription.deleteMany({
          where: { soapNoteId: existingSoapNote.id }
        });
        
        // Update soap note
        const updateData = {
          chiefComplaint: chiefComplaint || null,
          historyOfIllness: historyOfIllness || null,
          remarks: remarks || null,
          diagnosis: diagnosis || null,
          plan: plan || null,
          followUp: followUp || null,
          imageData: imageData || null,
        };
        soapNote = await tx.soapNote.update({
          where: { id: existingSoapNote.id },
          data: updateData,
        });

        // Create new prescriptions if provided
        if (prescriptions && Array.isArray(prescriptions) && prescriptions.length > 0) {
          await Promise.all(prescriptions.map((rx: any) => tx.prescription.create({
            data: {
              soapNoteId: soapNote.id,
              drug: rx.drug || '',
              dose: rx.dose || '',
              frequency: rx.frequency || '',
              duration: rx.duration || '',
              instructions: rx.instructions || '',
            },
          })));
        }
      });
    } else {
      // Create new
      const createData = {
        patientId,
        chiefComplaint: chiefComplaint || null,
        historyOfIllness: historyOfIllness || null,
        remarks: remarks || null,
        diagnosis: diagnosis || null,
        plan: plan || null,
        followUp: followUp || null,
        imageData: imageData || null,
      };
      soapNote = await prisma.soapNote.create({
        data: createData,
      });

      // Create prescriptions if provided
      if (prescriptions && Array.isArray(prescriptions) && prescriptions.length > 0) {
        await prisma.$transaction(
          prescriptions.map((rx: any) => prisma.prescription.create({
            data: {
              soapNoteId: soapNote.id,
              drug: rx.drug || '',
              dose: rx.dose || '',
              frequency: rx.frequency || '',
              duration: rx.duration || '',
              instructions: rx.instructions || '',
            },
          }))
        );
      }
    }

    return NextResponse.json({ message: "SOAP note saved successfully", soapNoteId: soapNote!.id });
  } catch (error: any) {
    console.error("[DOCTOR-SOAP-NOTE-ERROR]", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      patientId,
      sessionUser: session.user?.email
    });
    
    let errorMessage = "Failed to save SOAP note";
    if (error.code === 'P2002') {
      errorMessage = "Database constraint violation - data already exists or invalid";
    } else if (error.code?.startsWith('P20')) {
      errorMessage = `Database error: ${error.message}`;
    } else if (error.message?.includes('prisma')) {
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

  // Check if user is doctor
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (user?.role !== "DOCTOR") {
    return NextResponse.json({ error: "Forbidden: Doctor role required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");

  if (!patientId) {
    return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
  }

  try {
    // Doctor scope check
    const doctorScopePatient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        appointments: {
          some: {
            assignedToUserId: user.id,
            status: {
              in: ["PENDING", "CONFIRMED", "ACCEPTED"]
            }
          }
        }
      },
    });

    if (!doctorScopePatient) {
      return NextResponse.json({ 
        error: `Patient not assigned to you: ${patientId}` 
      }, { status: 403 });
    }

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

