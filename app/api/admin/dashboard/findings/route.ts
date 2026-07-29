import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const grouped = await prisma.clinicalFinding.groupBy({
      by: ["anatomy", "diagnosis"],
      _count: {
        diagnosis: true,
      },
      orderBy: {
        _count: {
          diagnosis: "desc",
        },
      },
    });

    const data = grouped.map((item: any) => ({
      anatomy: item.anatomy,
      diagnosis: item.diagnosis,
      count: item._count.diagnosis,
    }));

    console.log("📊 Findings data for analytics:", data);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching findings analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}