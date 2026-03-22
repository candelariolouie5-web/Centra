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

    // Mock data for consultations (replace with real doctor consultations when schema updated)
    const data = [
      { name: "ENT Consult", value: 45 },
      { name: "Follow-up", value: 30 },
      { name: "Emergency", value: 15 },
      { name: "Procedure", value: 10 },
    ];

    // Calculate highest/lowest
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    const highest = data.reduce((prev, curr) => (curr.value || 0) > (prev.value || 0) ? curr : prev);
    const lowest = data.reduce((prev, curr) => (curr.value || 0) < (prev.value || 0) ? curr : prev);

    const highestService = {
      name: highest.name,
      percentage: Math.round((highest.value / total) * 100),
    };

    const lowestService = {
      name: lowest.name,
      percentage: Math.round((lowest.value / total) * 100),
    };

    return NextResponse.json({ 
      data, 
      highestService, 
      lowestService 
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching doctor's consultations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

