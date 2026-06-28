import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET — list all secretaries (admin only)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const secretaries = await prisma.user.findMany({
      where: { role: "SECRETARY" },
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

    const activeCount = await prisma.user.count({
      where: { role: "SECRETARY", isActive: true },
    });

    return NextResponse.json({ secretaries, activeCount });
  } catch (error) {
    console.error("GET /api/admin/secretaries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch secretaries" },
      { status: 500 }
    );
  }
}

// POST — create a new secretary
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { name, email, password, isActive } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const secretary = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "SECRETARY",
        isActive: isActive ?? true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ secretary }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/secretaries error:", error);
    return NextResponse.json(
      { error: "Failed to create secretary" },
      { status: 500 }
    );
  }
}

// PATCH — toggle isActive
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, isActive } = await req.json();

    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "ID and isActive (boolean) are required" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, isActive: true },
    });

    return NextResponse.json({ secretary: updated });
  } catch (error) {
    console.error("PATCH /api/admin/secretaries error:", error);
    return NextResponse.json(
      { error: "Failed to update secretary" },
      { status: 500 }
    );
  }
}