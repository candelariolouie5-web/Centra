import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/* ===============================
   ADMIN → VIEW ADMIN-ASSIGNED APPOINTMENTS ONLY
================================ */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    // Fetch ADMIN-assigned appointments only, most recent first
    const appointments = await prisma.appointment.findMany({
      where: {
        assignedToRole: "ADMIN"
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN APPOINTMENTS GET ERROR]", error);
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === "development"
          ? (error instanceof Error ? error.message : String(error))
          : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/* ===============================
   ADMIN → APPROVE / REJECT APPOINTMENT (Any assignment)
   Note: Admins can update any appointment status (even DOCTOR ones if needed)
================================ */
function isValidStatusTransition(current: string, next: string): boolean {
  // Block changes to/from terminal states
  if (["CANCELLED", "REJECTED"].includes(current)) return false;
  if (["CANCELLED", "REJECTED"].includes(next)) {
    // Allow from active states
    return ["PENDING", "CONFIRMED", "ACCEPTED"].includes(current);
  }
  // Allow PENDING -> CONFIRMED (legacy)
  // Block same status
  return current !== next && ["PENDING"].includes(current) && next === "CONFIRMED";
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const { id, status } = await request.json();
    console.log("PATCH request received:", { id, status });

    if (!id || !["CONFIRMED", "CANCELLED", "REJECTED", "ACCEPTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Use CONFIRMED, CANCELLED, REJECTED, or ACCEPTED only." }, { status: 400 });
    }

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Transition validation
    const isValidTransition = isValidStatusTransition(existingAppointment.status, status);
    if (!isValidTransition) {
      return NextResponse.json({ error: `Invalid status transition: ${existingAppointment.status} → ${status}` }, { status: 400 });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, appointment }, { status: 200 });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
