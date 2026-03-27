import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma, getAvailabilityForSlot } from "@/lib/prisma";

/* ===============================
   HELPERS
================================ */
function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/* ===============================
   SHARED → GET SLOT AVAILABILITY
   Exact account capacity:
   - 1 free ADMIN account = 1 slot
   - 1 free DOCTOR account = 1 slot
   - same exact date+time cannot exceed exact active eligible accounts

   RULES:
   - public user booking: same-day NOT allowed
   - admin/doctor staff scheduling: same-day allowed
================================ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const time = searchParams.get("time");
    const source = searchParams.get("source");
    const specificSlot = Boolean(dateStr && time);

    const session = await getServerSession(authOptions);
    const isStaffSession =
      session?.user?.role === "ADMIN" || session?.user?.role === "DOCTOR";
    const isStaffRequest = source === "staff" || isStaffSession;

    if (specificSlot) {
      const today = getLocalDateString();

      if (!isStaffRequest && dateStr === today) {
        return NextResponse.json(
          {
            slotInfo: {
              date: dateStr,
              time,
              capacity: 0,
              booked: 0,
              occupied: 0,
              remaining: 0,
              isFull: true,
              reason: "Same-day booking is not allowed",
            },
          },
          { status: 200 }
        );
      }

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