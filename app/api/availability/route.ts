import { NextResponse } from "next/server";
import { prisma, getActiveDoctorCount } from "@/lib/prisma";

/* =============================== 
   PUBLIC → GET ALL CONFIRMED APPOINTMENTS FOR AVAILABILITY
   AND BLOCKED DATES
================================ */
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        status: {
          in: ["CONFIRMED", "PENDING", "ACCEPTED"]
        }
      },
      select: {
        appointmentDate: true,
        appointmentTime: true,
        serviceType: true,
      },
    });

    // Fetch blocked dates
    const blockedDates = await prisma.blockedDate.findMany({
      select: {
        id: true,
        startDate: true,
        endDate: true,
        reason: true,
      },
    });

    const activeDoctorCount = await getActiveDoctorCount();
    return NextResponse.json({ appointments, blockedDates, activeDoctorCount }, { status: 200 });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

