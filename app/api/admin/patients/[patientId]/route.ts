import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { patientId } = await params;

  if (!patientId) {
    return NextResponse.json({ error: "Patient ID required" }, { status: 400 });
  }

  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.patient.delete({
        where: { id: patientId },
      });
    });

    return NextResponse.json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Admin delete patient error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}