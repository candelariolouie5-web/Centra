import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get today's date at midnight (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date (start of next day)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch appointments for today with status CONFIRMED or ACCEPTED
    const appointments = await prisma.appointment.findMany({
      where: {
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
    console.error("Error fetching today's appointments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
