import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  BUSY_APPOINTMENT_STATUSES,
  getDayRange,
  prisma,
} from "@/lib/prisma";

/* ===============================
   ADMIN → GET ADMIN BLOCKED DATES ONLY
================================ */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isActive: true },
    });

    if (!admin || admin.role !== "ADMIN" || !admin.isActive) {
      return NextResponse.json(
        { error: "Forbidden: Active admin only" },
        { status: 403 }
      );
    }

    const blockedDates = await prisma.blockedDate.findMany({
      where: {
        doctorId: null,
      },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json({ blockedDates }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN BLOCKED DATES GET ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ===============================
   ADMIN → CREATE ADMIN BLOCKED DATE + CANCEL ADMIN CONFLICTS ONLY
================================ */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isActive: true },
    });

    if (!admin || admin.role !== "ADMIN" || !admin.isActive) {
      return NextResponse.json(
        { error: "Forbidden: Active admin only" },
        { status: 403 }
      );
    }

    const { startDate, endDate, reason } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
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

    const result = await prisma.$transaction(async (tx: any) => {
      const appointmentsToCancel = await tx.appointment.findMany({
        where: {
          assignedToRole: "ADMIN",
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
        appointmentsToCancel.map((appointment: any) =>
          tx.appointment.update({
            where: { id: appointment.id },
            data: { status: "CANCELLED" },
          })
        )
      );

      const blockedDate = await tx.blockedDate.create({
        data: {
          startDate: startDay,
          endDate: endDay,
          reason: reason?.trim() || null,
          doctorId: null,
        },
      });

      return {
        success: true,
        blockedDate,
        cancelledAppointmentsCount: appointmentsToCancel.length,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[ADMIN BLOCKED DATES POST ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ===============================
   ADMIN → DELETE OWN TYPE OF BLOCKED DATE ONLY
================================ */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isActive: true },
    });

    if (!admin || admin.role !== "ADMIN" || !admin.isActive) {
      return NextResponse.json(
        { error: "Forbidden: Active admin only" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Blocked date ID is required" },
        { status: 400 }
      );
    }

    const blockedDate = await prisma.blockedDate.findFirst({
      where: {
        id,
        doctorId: null,
      },
    });

    if (!blockedDate) {
      return NextResponse.json(
        { error: "Admin blocked date not found" },
        { status: 404 }
      );
    }

    await prisma.blockedDate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN BLOCKED DATES DELETE ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}