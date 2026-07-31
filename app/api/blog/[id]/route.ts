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
    const blogPost = await prisma.blogPost.findUnique({
      where: { id },
    });
    if (!blogPost) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(blogPost);
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
    const blogPost = await prisma.blogPost.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(blogPost);
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
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}