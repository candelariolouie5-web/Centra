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
    const months = monthsStr
      ? monthsStr
          .split(",")
          .map((value) => parseInt(value, 10))
          .filter((value) => !Number.isNaN(value))
      : [];

    const doctor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!doctor || doctor.role !== "DOCTOR") {
      return NextResponse.json({ error: "Doctor not found" }, { status: 403 });
    }

    const whereClause: any = {
      assignedToRole: "DOCTOR",
      assignedToUserId: doctor.id,
      status: {
        in: ["PENDING", "CONFIRMED", "ACCEPTED"],
      },
    };

    if (months.length > 0) {
      const validMonths = months.filter((m) => m >= 0 && m <= 11);

      if (validMonths.length > 0) {
        const ranges = validMonths.map((month) => ({
          appointmentDate: {
            gte: new Date(year, month, 1, 0, 0, 0, 0),
            lt: new Date(year, month + 1, 1, 0, 0, 0, 0),
          },
        }));

        whereClause.OR = ranges;
      }
    } else {
      whereClause.appointmentDate = {
        gte: new Date(year, 0, 1, 0, 0, 0, 0),
        lt: new Date(year + 1, 0, 1, 0, 0, 0, 0),
      };
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      select: {
        appointmentDate: true,
      },
      orderBy: {
        appointmentDate: "asc",
      },
    });

    const monthCountMap = new Map<string, number>();

    for (const appt of appointments) {
      const monthLabel = new Date(appt.appointmentDate).toLocaleDateString("en-US", {
        month: "short",
      });

      monthCountMap.set(monthLabel, (monthCountMap.get(monthLabel) || 0) + 1);
    }

    const data = Array.from(monthCountMap.entries()).map(([month, count]) => ({
      month,
      count,
    }));

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching doctor's appointments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}