import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma, getActiveDoctorCount, canDeactivateDoctor } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET: List all doctors
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isActive: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const doctors = await prisma.user.findMany({
      where: { role: "DOCTOR" },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const activeCount = await getActiveDoctorCount();

    return NextResponse.json({ doctors, activeCount }, { status: 200 });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create new doctor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isActive: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const { name, username, password } = await request.json();

    if (!name || !username || !password || password.length < 6) {
      return NextResponse.json({ error: "Name, username, and password (min 6 chars) required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: username } });
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await prisma.user.create({
      data: {
        name,
        email: username,
        password: hashedPassword,
        role: "DOCTOR",
        isActive: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, doctor }, { status: 201 });
  } catch (error) {
    console.error("Error creating doctor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH: Toggle active status / Update doctor (NO PARAMS – get ID from body)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const body = await request.json();
    const { id, isActive, name } = body;

    if (!id) {
      return NextResponse.json({ error: "Doctor ID is required" }, { status: 400 });
    }

    const updateData: Partial<{ isActive: boolean; name: string }> = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (name) updateData.name = name;

    const force = request.nextUrl.searchParams.get('force') === 'true';
    if (updateData.isActive === false) {
      const canDeact = await canDeactivateDoctor(force);
      if (!canDeact.ok) {
        return NextResponse.json({ error: canDeact.error }, { status: 400 });
      }
    }

    const doctor = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, isActive: true },
    });

    return NextResponse.json({ success: true, doctor }, { status: 200 });
  } catch (error) {
    console.error("Error updating doctor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}