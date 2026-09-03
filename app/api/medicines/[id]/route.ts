import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user?.role;
    if (userRole !== "ADMIN" && userRole !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized - Invalid role" }, { status: 401 });
    }

    await prisma.medicine.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Medicine deleted" });
  } catch (error) {
    console.error("Error deleting medicine:", error);
    return NextResponse.json(
      { error: "Failed to delete medicine" },
      { status: 500 }
    );
  }
}