import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// ---- DELETE (existing) ----
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Forbidden: Doctor only" }, { status: 403 });
  }

  const doctorId = user.id;
  const { patientId } = await params;

  if (!patientId) {
    return NextResponse.json({ error: "Patient ID required" }, { status: 400 });
  }

  try {
    const ownershipCheck = await prisma.appointment.findFirst({
      where: {
        assignedToRole: "DOCTOR",
        assignedToUserId: doctorId,
        patientId: patientId,
        status: {
          in: ["PENDING", "CONFIRMED", "ACCEPTED"],
        },
      },
    });

    if (!ownershipCheck) {
      return NextResponse.json({ error: "Forbidden: Patient not assigned to you" }, { status: 403 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.patient.delete({
        where: { id: patientId },
      });
    });

    return NextResponse.json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Doctor delete patient error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---- PUT (fixed) ----
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Forbidden: Doctor only" }, { status: 403 });
  }

  const doctorId = user.id;
  const { patientId } = await params;
  if (!patientId) {
    return NextResponse.json({ error: "Patient ID required" }, { status: 400 });
  }

  // Ownership check (same as DELETE)
  const ownershipCheck = await prisma.appointment.findFirst({
    where: {
      assignedToRole: "DOCTOR",
      assignedToUserId: doctorId,
      patientId: patientId,
      status: { in: ["PENDING", "CONFIRMED", "ACCEPTED"] },
    },
  });
  if (!ownershipCheck) {
    return NextResponse.json(
      { error: "Forbidden: Patient not assigned to you" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { name, age, gender, phone, address, email } = body;

  console.log("🔵 Doctor PUT - patientId:", patientId);
  console.log("🔵 Doctor PUT - payload:", body);

  // Email uniqueness check (across all patients)
  if (email) {
    const existing = await prisma.patient.findFirst({
      where: { email, NOT: { id: patientId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use by another patient" },
        { status: 400 }
      );
    }
  }

  try {
    const updated = await prisma.patient.update({
      where: { id: patientId },
      data: {
        name: name?.trim() || undefined,
        age: age ? parseInt(age, 10) : null,
        gender: gender?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        email: email?.trim() || null,
      },
    });
    console.log("✅ Doctor PUT - updated patient:", updated);
    return NextResponse.json({ patient: updated });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    console.error("Doctor update patient error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}