import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString());
    const monthsStr = url.searchParams.get('months') || '';
    const months = monthsStr ? monthsStr.split(',').map(Number) : [];

    let whereClause: any = {
      status: {
        in: ['CONFIRMED', 'ACCEPTED'],
      },
    };

    if (months.length > 0) {
      whereClause.appointmentDate = {
        gte: new Date(year, 0, 1),
        lte: new Date(year, 11, 31),
      };
    }

    const appointments = await prisma.appointment.groupBy({
      by: ['appointmentDate'],
      where: whereClause,
      _count: {
        id: true,
      },
      orderBy: {
        appointmentDate: 'asc',
      },
    });

    const data = appointments.map((appt: any) => ({
      month: new Date(appt.appointmentDate).toLocaleDateString('en-US', { month: 'short' }),
      count: appt._count.id,
    }));

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching doctor's appointments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

