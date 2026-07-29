import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, anatomy, diagnosis, impression } = body;

    console.log("📥 API received request:", { patientId, anatomy, diagnosis });

    if (!patientId || !anatomy || !diagnosis) {
      return NextResponse.json(
        { error: "Missing required fields: patientId, anatomy, diagnosis" },
        { status: 400 }
      );
    }

    if (patientId === "temp") {
      return NextResponse.json(
        { error: "Invalid patient ID. Please use a valid patient ID." },
        { status: 400 }
      );
    }

    const finding = await prisma.clinicalFinding.create({
      data: {
        patientId,
        anatomy,
        diagnosis,
        impression: impression || null,
      },
    });

    console.log("✅ Clinical finding created:", finding);

    return NextResponse.json({ success: true, finding }, { status: 201 });
  } catch (error) {
    console.error("🔥 Error saving clinical finding:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}