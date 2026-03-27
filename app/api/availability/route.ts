import { NextRequest, NextResponse } from "next/server";
import { prisma, getAvailabilityForSlot } from "@/lib/prisma";

/* ===============================
   PUBLIC → GET SLOT AVAILABILITY
   Exact account capacity:
   - 1 free ADMIN account = 1 slot
   - 1 free DOCTOR account = 1 slot
   - same exact date+time cannot exceed exact active eligible accounts
================================ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const time = searchParams.get("time");
    const specificSlot = Boolean(dateStr && time);

    if (specificSlot) {
      const slotInfo = await getAvailabilityForSlot(dateStr as string, time as string);

      return NextResponse.json(
        {
          slotInfo: {
            date: dateStr,
            time,
            capacity: slotInfo.capacity,
            booked: slotInfo.occupied,
            occupied: slotInfo.occupied,
            remaining: slotInfo.remaining,
            isFull: slotInfo.isFull,
          },
        },
        { status: 200 }
      );
    }

    const blockedDates = await prisma.blockedDate.findMany({
      select: {
        id: true,
        startDate: true,
        endDate: true,
        reason: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return NextResponse.json(
      {
        blockedDates,
        note: "Use ?date=YYYY-MM-DD&time=HH:MM for exact slot availability.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching availability:", error);

    return NextResponse.json(
      {
        slotInfo: {
          capacity: 0,
          booked: 0,
          occupied: 0,
          remaining: 0,
          isFull: true,
        },
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}