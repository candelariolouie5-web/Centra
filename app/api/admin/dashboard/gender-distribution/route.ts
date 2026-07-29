import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        gender: { not: null },
      },
      select: {
        gender: true,
      },
    });

    const counts: Record<string, number> = {};
    for (const p of patients) {
      const gender = p.gender?.toLowerCase() || "unknown";
      counts[gender] = (counts[gender] || 0) + 1;
    }

    const genderData = Object.entries(counts).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
    }));

    return NextResponse.json({ genderData });
  } catch (error) {
    console.error("[GENDER-DISTRIBUTION]", error);
    return NextResponse.json(
      { error: "Failed to fetch gender distribution" },
      { status: 500 }
    );
  }
}