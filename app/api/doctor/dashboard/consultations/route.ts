import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type ServiceRow = {
  name: string;
  value: number;
};

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      },
      select: {
        serviceType: true,
      },
    });

    const serviceMap = new Map<string, number>();

    for (const item of appointments) {
      const rawName =
        typeof item.serviceType === "string" && item.serviceType.trim()
          ? item.serviceType.trim()
          : "Uncategorized";

      serviceMap.set(rawName, (serviceMap.get(rawName) || 0) + 1);
    }

    const data: ServiceRow[] = Array.from(serviceMap.entries())
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);

    if (data.length === 0) {
      return NextResponse.json(
        {
          data: [],
          highestService: null,
          lowestService: null,
        },
        { status: 200 }
      );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    const highest = data.reduce((prev, curr) =>
      curr.value > prev.value ? curr : prev
    );
    const lowest = data.reduce((prev, curr) =>
      curr.value < prev.value ? curr : prev
    );

    const highestService = {
      name: highest.name,
      percentage: Number(((highest.value / total) * 100).toFixed(1)),
    };

    const lowestService = {
      name: lowest.name,
      percentage: Number(((lowest.value / total) * 100).toFixed(1)),
    };

    return NextResponse.json(
      {
        data,
        highestService,
        lowestService,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching doctor's consultations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}