import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma, canDeactivateDoctor } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const doctorId = await params.then(p => p.id);

    // Prevent deleting self
    if (session.user.id === doctorId) {
      return NextResponse.json({ error: "Cannot delete self" }, { status: 400 });
    }

    const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
    if (!doctor || doctor.role !== "DOCTOR") {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const force = request.nextUrl.searchParams.get('force') === 'true';
    const canDeact = await canDeactivateDoctor(force);
    if (!canDeact.ok) {
      return NextResponse.json({ error: canDeact.error }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: doctorId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

