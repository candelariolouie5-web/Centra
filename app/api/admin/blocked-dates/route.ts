import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/* ===============================
   ADMIN → GET ALL BLOCKED DATES
================================ */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    // Fetch all blocked dates, sorted by start date
    const blockedDates = await prisma.blockedDate.findMany({
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json({ blockedDates }, { status: 200 });
  } catch (error) {
    console.error("Error fetching blocked dates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ===============================
   ADMIN → CREATE BLOCKED DATE RANGE
================================ */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const { startDate, endDate, reason } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start date and end date are required" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return NextResponse.json({ error: "Start date must be before end date" }, { status: 400 });
    }

    // Cancel all future appointments within the blocked date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all appointments that are:
    // 1. In the future (appointmentDate >= today)
    // 2. Within the blocked date range
    // 3. Not already cancelled
    const appointmentsToCancel = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: start,
          lte: end,
        },
        status: {
          in: ["CONFIRMED", "ACCEPTED"],
        },
      },
    });

    // Cancel each appointment
    const cancelPromises = appointmentsToCancel.map((appointment) =>
      prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: "CANCELLED" },
      })
    );

    await Promise.all(cancelPromises);

    // Create the blocked date record
    const blockedDate = await prisma.blockedDate.create({
      data: {
        startDate: start,
        endDate: end,
        reason: reason || "Vacation",
      },
    });

    return NextResponse.json(
      {
        success: true,
        blockedDate,
        cancelledAppointmentsCount: appointmentsToCancel.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating blocked date:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ===============================
   ADMIN → DELETE BLOCKED DATE
================================ */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Blocked date ID is required" }, { status: 400 });
    }

    // Check if blocked date exists
    const blockedDate = await prisma.blockedDate.findUnique({
      where: { id },
    });

    if (!blockedDate) {
      return NextResponse.json({ error: "Blocked date not found" }, { status: 404 });
    }

    // Delete the blocked date
    await prisma.blockedDate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting blocked date:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
