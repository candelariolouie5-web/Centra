import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { patientId } = await params;

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const latestAppointment = await prisma.appointment.findFirst({
      where: {
        patientId: patientId,
        secretaryStatus: {
          notIn: ["CANCELLED", "NO_SHOW"],
        },
      },
      orderBy: {
        appointmentDate: "desc",
      },
      select: {
        id: true,
        fullName: true,
        serviceType: true,
        appointmentDate: true,
        appointmentTime: true,
        contactNumber: true,
        secretaryStatus: true,
      },
    });

    return NextResponse.json({ appointment: latestAppointment });
  } catch (error) {
    console.error("Failed to fetch latest appointment:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest appointment" },
      { status: 500 }
    );
  }
}