import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const year = parseInt(
      url.searchParams.get("year") || new Date().getFullYear().toString(),
      10
    );

    const monthsStr = url.searchParams.get("months") || "";
    const parsedMonths = monthsStr
      .split(",")
      .map((value) => parseInt(value, 10))
      .filter((value) => !Number.isNaN(value) && value >= 1 && value <= 12);

    const selectedMonths =
      parsedMonths.length > 0
        ? Array.from(new Set(parsedMonths)).sort((a, b) => a - b)
        : Array.from({ length: 12 }, (_, index) => index + 1);

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
        status: {
          in: ["PENDING", "CONFIRMED", "ACCEPTED"],
        },
        appointmentDate: {
          gte: new Date(year, 0, 1, 0, 0, 0, 0),
          lt: new Date(year + 1, 0, 1, 0, 0, 0, 0),
        },
      },
      select: {
        appointmentDate: true,
      },
      orderBy: {
        appointmentDate: "asc",
      },
    });

    const monthCountMap = new Map<number, number>();

    for (const appt of appointments) {
      const monthNumber = new Date(appt.appointmentDate).getMonth() + 1;
      monthCountMap.set(monthNumber, (monthCountMap.get(monthNumber) || 0) + 1);
    }

    const data = selectedMonths.map((monthNumber) => ({
      month: new Date(year, monthNumber - 1, 1).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      count: monthCountMap.get(monthNumber) || 0,
    }));

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching doctor's appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}