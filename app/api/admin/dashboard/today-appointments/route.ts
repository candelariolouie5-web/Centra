import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await prisma.appointment.findMany({
      where: {
        assignedToRole: "ADMIN",  // ADMIN-only visibility
        appointmentDate: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: ['CONFIRMED', 'ACCEPTED'],
        },
      },
      select: {
        id: true,
        fullName: true,
        appointmentTime: true,
        serviceType: true,
        status: true,
      },
      orderBy: {
        appointmentTime: 'asc',
      },
    });

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin today's appointments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
