import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ← CHANGE
) {
  try {
    const { id } = await params;  // ← ADD: await params
    const service = await prisma.service.findUnique({
      where: { id },
    });
    if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ← CHANGE
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;  // ← ADD: await params
    const body = await request.json();
    const service = await prisma.service.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ← CHANGE
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;  // ← ADD: await params

    // ✅ FIXED: Use prisma.service.delete() NOT prisma.announcement.delete()
    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}