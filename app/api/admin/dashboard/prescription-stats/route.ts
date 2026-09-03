// app/api/admin/dashboard/prescription-stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Total this month
    const totalPrescriptions = await prisma.prescription.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
    });

    // Top 5 this month
    const topMeds = await prisma.prescription.groupBy({
      by: ["generic"],
      where: {
        createdAt: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
      _count: { generic: true },
      orderBy: { _count: { generic: "desc" } },
      take: 5,
    });

    // 6-month trend (buwan-buwan, kasama na ang kasalukuyang buwan)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrendRaw: any[] = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*)::int as count
      FROM "Prescription"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    const monthlyTrend = monthlyTrendRaw.map((row: any) => ({
      month: row.month.toLocaleString("en-US", { month: "short", year: "numeric" }),
      count: Number(row.count),
    }));

    return NextResponse.json({
      totalPrescriptions,
      topMeds: topMeds.map((item: any) => ({
        name: item.generic,
        count: item._count.generic,
      })),
      monthlyTrend,
    });
  } catch (error) {
    console.error("[PRESCRIPTION-STATS]", error);
    return NextResponse.json(
      { error: "Failed to fetch prescription stats" },
      { status: 500 }
    );
  }
}