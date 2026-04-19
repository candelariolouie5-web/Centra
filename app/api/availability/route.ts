import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAvailabilityForSlot } from "@/lib/prisma";

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

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

/* ===============================
   SHARED → GET SLOT / DAY AVAILABILITY
================================ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const time = searchParams.get("time");
    const source = searchParams.get("source");

    const session = await getServerSession(authOptions);
    const isStaffSession =
      session?.user?.role === "ADMIN" || session?.user?.role === "DOCTOR";
    const isStaffRequest = source === "staff" || isStaffSession;

    const today = getLocalDateString();

    /* ===============================
       DATE + TIME → EXACT SLOT
    ============================== */
    if (dateStr && time) {
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

      const slotInfo = await getAvailabilityForSlot(dateStr, time);

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

    /* ===============================
       DATE ONLY → WHOLE DAY SUMMARY
    ============================== */
    if (dateStr) {
      if (!isStaffRequest && dateStr === today) {
        const slots = TIME_SLOTS.map((slot) => ({
          time: slot,
          capacity: 0,
          booked: 0,
          occupied: 0,
          remaining: 0,
          isFull: true,
          reason: "Same-day booking is not allowed",
        }));

        return NextResponse.json(
          {
            date: dateStr,
            slots,
            dayFullyBlocked: true,
            dayHasAnyAvailableSlot: false,
            reason: "Same-day booking is not allowed",
          },
          { status: 200 }
        );
      }

      const slots = await Promise.all(
        TIME_SLOTS.map(async (slot) => {
          const slotInfo = await getAvailabilityForSlot(dateStr, slot);

          return {
            time: slot,
            capacity: slotInfo.capacity,
            booked: slotInfo.occupied,
            occupied: slotInfo.occupied,
            remaining: slotInfo.remaining,
            isFull: slotInfo.isFull,
          };
        })
      );

      const dayFullyBlocked = slots.every((slot) => slot.capacity <= 0);
      const dayHasAnyAvailableSlot = slots.some((slot) => slot.remaining > 0);

      return NextResponse.json(
        {
          date: dateStr,
          slots,
          dayFullyBlocked,
          dayHasAnyAvailableSlot,
        },
        { status: 200 }
      );
    }

    /* ===============================
       NO DATE → DO NOT RETURN RAW BLOCKED DATES
    ============================== */
    return NextResponse.json(
      {
        blockedDates: [],
        note: "Use ?date=YYYY-MM-DD for day availability or ?date=YYYY-MM-DD&time=HH:MM for exact slot availability.",
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