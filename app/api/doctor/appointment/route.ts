import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/* ===============================
   DOCTOR → VIEW DOCTOR-OWNED APPOINTMENTS ONLY
================================ */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!doctor || doctor.role !== "DOCTOR") {
      return NextResponse.json({ error: "Forbidden: Doctor only" }, { status: 403 });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        assignedToRole: "DOCTOR",
        assignedToUserId: doctor.id,
        status: {
          in: ["PENDING", "CONFIRMED", "ACCEPTED"],
        },
      },
      include: {
        patient: true,
      },
      orderBy: [{ appointmentDate: "desc" }, { appointmentTime: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    console.error("[DOCTOR APPOINTMENTS GET ERROR]", error);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}