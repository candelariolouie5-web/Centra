import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Kunin ang huling 5 pasyente na may appointment
    const recentPatients = await prisma.patient.findMany({
      where: {
        appointments: {
          some: {}, // may kahit isang appointment
        },
      },
      orderBy: {
        appointments: {
          _count: "desc",
        },
      },
      take: 5,
      select: {
        id: true,
        name: true,
        phone: true,
        age: true,
        gender: true,
        email: true,
        appointments: {
          orderBy: { appointmentDate: "desc" },
          take: 1,
          select: { appointmentDate: true },
        },
      },
    });

    const formatted = recentPatients.map((p: any) => ({
      ...p,
      lastVisit: p.appointments[0]?.appointmentDate || null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Recent patients error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}