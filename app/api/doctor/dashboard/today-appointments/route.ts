import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const doctor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!doctor || doctor.role !== "DOCTOR") {
      return NextResponse.json({ error: "Doctor not found" }, { status: 403 });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        assignedToRole: "DOCTOR",
        assignedToUserId: doctor.id,
        appointmentDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
        status: {
          in: ["PENDING", "CONFIRMED", "ACCEPTED"],
        },
      },
      select: {
        id: true,
        fullName: true,
        appointmentTime: true,
        serviceType: true,
        status: true,
        patientId: true,
      },
      orderBy: {
        appointmentTime: "asc",
      },
    });

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching doctor's today's appointments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}