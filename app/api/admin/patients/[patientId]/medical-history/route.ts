import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// Ensure upload directory exists
async function ensureUploadDir(dirPath: string) {
  try {
    const { default: fs } = await import("fs");
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (error) {
    console.error("Error creating directory:", error);
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { patientId } = await params;

  if (!patientId) {
    return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
  }

  try {
    // Check if patient exists
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, role: true },
    });

    if (!patient || patient.role !== "USER") {
      return NextResponse.json({ error: "Invalid patient" }, { status: 400 });
    }

    // Get medical histories for the patient
    const medicalHistories = await prisma.medicalHistory.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ medicalHistories });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch medical histories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { patientId } = await params;

  if (!patientId) {
    return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
  }

  try {
    // Check if patient exists
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, role: true },
    });

    if (!patient || patient.role !== "USER") {
      return NextResponse.json({ error: "Invalid patient" }, { status: 400 });
    }

    const formData = await request.formData();
    
    const type = formData.get("type") as string;
    const resultDateStr = formData.get("resultDate") as string;
    const lab = formData.get("lab") as string;
    const remarks = formData.get("remarks") as string;
    const photos = formData.getAll("photos") as File[];

    if (!type || !resultDateStr || !remarks) {
      return NextResponse.json({ error: "Type, result date, and remarks are required" }, { status: 400 });
    }

    // Parse date string and create date in local time ( noon to avoid timezone issues)
    // This ensures the date stays as selected regardless of timezone
    const [year, month, day] = resultDateStr.split('-').map(Number);
    const resultDate = new Date(year, month - 1, day, 12, 0, 0);

    // Process uploaded images
    const photoUrls: string[] = [];
    const uploadDir = join(process.cwd(), "public", "uploads", "medical-history");
    
    // Ensure upload directory exists
    await ensureUploadDir(uploadDir);

    for (const photo of photos) {
      if (photo && photo.size > 0) {
        try {
          const bytes = await photo.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          // Generate unique filename
          const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
          const fileName = `${uniqueSuffix}-${photo.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
          const filePath = join(uploadDir, fileName);
          
          await writeFile(filePath, buffer);
          photoUrls.push(`/uploads/medical-history/${fileName}`);
        } catch (photoError) {
          console.error("Error uploading photo:", photoError);
          // Continue with other photos even if one fails
        }
      }
    }

    // Create medical history record
    const medicalHistory = await prisma.medicalHistory.create({
      data: {
        patientId,
        type,
        resultDate: resultDate,
        lab: lab || null,
        remarks,
        photos: photoUrls,
      },
    });

    return NextResponse.json({ message: "Medical history created successfully", medicalHistory });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create medical history" }, { status: 500 });
  }
}
