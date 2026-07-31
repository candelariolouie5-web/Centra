import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ← CHANGE: params is now a Promise
) {
  try {
    const { id } = await params;  // ← ADD: await params
    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });
    if (!announcement) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(announcement);
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
    const { title, description, bannerImage, status } = body;
    const announcement = await prisma.announcement.update({
      where: { id },
      data: { title, description, bannerImage, status, updatedAt: new Date() },
    });
    return NextResponse.json(announcement);
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
    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}