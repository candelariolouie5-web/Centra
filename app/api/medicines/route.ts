import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const medicines = await prisma.medicine.findMany({
      orderBy: {
        generic: "asc",
      },
    });

    return NextResponse.json({ medicines });
  } catch (error) {
    console.error("Error fetching medicines:", error);
    return NextResponse.json(
      { error: "Failed to fetch medicines" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized - No session" }, { status: 401 });
    }

    // Check if user has ADMIN or DOCTOR role
    const userRole = session.user?.role;
    if (userRole !== "ADMIN" && userRole !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized - Invalid role" }, { status: 401 });
    }

    const body = await req.json();
    const { generic, brandName, quantity, dosage, instructions } = body;

    if (!generic) {
      return NextResponse.json(
        { error: "Generic name is required" },
        { status: 400 }
      );
    }

    const medicine = await prisma.medicine.create({
      data: {
        generic,
        brandName: brandName || "",
        quantity: quantity || "",
        dosage: dosage || "",
        instructions: instructions || "",
      },
    });

    return NextResponse.json({ medicine }, { status: 201 });
  } catch (error) {
    console.error("Error creating medicine:", error);
    return NextResponse.json(
      { error: "Failed to create medicine" },
      { status: 500 }
    );
  }
}