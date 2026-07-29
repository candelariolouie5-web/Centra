import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get all appointments that have a valid age (non-null)
    const appointments = await prisma.appointment.findMany({
      where: {
        age: { not: null },
      },
      select: {
        age: true,
      },
    });

    const counts = {
      "0-12": 0,
      "13-19": 0,
      "20-59": 0,
      "60+": 0,
    };

    for (const appt of appointments) {
      const age = appt.age;
      if (age === null || age === undefined) continue;
      if (age <= 12) counts["0-12"]++;
      else if (age <= 19) counts["13-19"]++;
      else if (age <= 59) counts["20-59"]++;
      else counts["60+"]++;
    }

    const ageGroups = Object.entries(counts).map(([group, count]) => ({
      group,
      count,
    }));

    // Also compute average age
    const totalAge = appointments.reduce((sum, a) => sum + (a.age || 0), 0);
    const avgAge = appointments.length > 0 ? Math.round(totalAge / appointments.length) : 0;

    return NextResponse.json({ ageGroups, avgAge });
  } catch (error) {
    console.error("[AGE-DISTRIBUTION]", error);
    return NextResponse.json(
      { error: "Failed to fetch age distribution" },
      { status: 500 }
    );
  }
}