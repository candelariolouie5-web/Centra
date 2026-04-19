import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  BUSY_APPOINTMENT_STATUSES,
  getDayRange,
  prisma,
} from "@/lib/prisma";

/* ===============================
   DOCTOR → GET OWN BLOCKED DATES ONLY
================================ */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isActive: true },
    });

    if (!doctor || doctor.role !== "DOCTOR" || !doctor.isActive) {
      return NextResponse.json(
        { error: "Forbidden: Active doctor only" },
        { status: 403 }
      );
    }

    const blockedDates = await prisma.blockedDate.findMany({
      where: {
        doctorId: session.user.id,
      },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json({ blockedDates }, { status: 200 });
  } catch (error) {
    console.error("[DOCTOR BLOCKED DATES GET ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ===============================
   DOCTOR → CREATE OWN BLOCKED DATE + CANCEL OWN CONFLICTS
================================ */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isActive: true },
    });

    if (!doctor || doctor.role !== "DOCTOR" || !doctor.isActive) {
      return NextResponse.json(
        { error: "Forbidden: Active doctor only" },
        { status: 403 }
      );
    }

    const { startDate, endDate, reason } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start and end dates required" },
        { status: 400 }
      );
    }

    const { start: startDay } = getDayRange(startDate);
    const { end: endDay } = getDayRange(endDate);

    if (startDay > endDay) {
      return NextResponse.json(
        { error: "Start date must be before end date" },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cancelFrom = startDay > today ? startDay : today;

    const result = await prisma.$transaction(async (tx) => {
      const appointmentsToCancel = await tx.appointment.findMany({
        where: {
          assignedToUserId: session.user.id,
          appointmentDate: {
            gte: cancelFrom,
            lte: endDay,
          },
          status: {
            in: [...BUSY_APPOINTMENT_STATUSES],
          },
        },
      });

      await Promise.all(
        appointmentsToCancel.map((appt) =>
          tx.appointment.update({
            where: { id: appt.id },
            data: { status: "CANCELLED" },
          })
        )
      );

      const blockedDate = await tx.blockedDate.create({
        data: {
          startDate: startDay,
          endDate: endDay,
          reason: reason?.trim() || null,
          doctorId: session.user.id,
        },
      });

      return {
        blockedDate,
        cancelledAppointmentsCount: appointmentsToCancel.length,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[DOCTOR BLOCKED DATES POST ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ===============================
   DOCTOR → DELETE OWN BLOCKED DATE ONLY
================================ */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isActive: true },
    });

    if (!doctor || doctor.role !== "DOCTOR" || !doctor.isActive) {
      return NextResponse.json(
        { error: "Forbidden: Active doctor only" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Blocked date ID required (?id=...)" },
        { status: 400 }
      );
    }

    const blockedDate = await prisma.blockedDate.findFirst({
      where: {
        id,
        doctorId: session.user.id,
      },
    });

    if (!blockedDate) {
      return NextResponse.json(
        { error: "Blocked date not found or not yours" },
        { status: 404 }
      );
    }

    await prisma.blockedDate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[DOCTOR BLOCKED DATES DELETE ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}