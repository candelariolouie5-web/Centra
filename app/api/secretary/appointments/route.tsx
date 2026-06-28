import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function parseDateOnly(dateInput: string) {
  const [year, month, day] = dateInput.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export async function GET() {
  try {
    const { start, end } = getTodayRange();

    const appointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: start,
          lte: end,
        },
        assignedToRole: {
          in: ["ADMIN", "DOCTOR"],
        },
        status: {
          in: ["PENDING", "CONFIRMED", "ACCEPTED"],
        },
        secretaryStatus: {
          notIn: ["COMPLETED", "CANCELLED", "NO_SHOW"],
        },
      },
      orderBy: [
        { appointmentTime: "asc" },
        { createdAt: "asc" },
      ],
      include: {
        patient: true,
        secretaryVitals: true,
        secretaryFollowUps: true,
        secretaryProcedures: true,
      },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Secretary appointments GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch today's appointments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      fullName,
      email,
      serviceType,
      appointmentDate,
      appointmentTime,
      age,
      contactNumber,
      patientId,
      userId,
      source,
    } = body;

    if (!fullName || !email || !serviceType || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: "Missing required appointment fields" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        fullName,
        email,
        serviceType,
        appointmentDate: parseDateOnly(appointmentDate),
        appointmentTime,
        age: age ? Number(age) : null,
        contactNumber: contactNumber || null,
        patientId: patientId || null,
        userId: userId || null,
        source: source || "SECRETARY",
        createdByRole: "SECRETARY",
        status: "CONFIRMED",
        secretaryStatus: "PENDING",
      },
      include: {
        patient: true,
        secretaryVitals: true,
        secretaryFollowUps: true,
        secretaryProcedures: true,
      },
    });

    // ---------- Send SMS confirmation ----------
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      await fetch(`${baseUrl}/api/sms/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: appointment.contactNumber,
          message: `Hi ${appointment.fullName}, your ${appointment.serviceType} appointment at Centra Clinic is confirmed for ${formattedDate} at ${appointment.appointmentTime}. Please arrive 10 minutes early. Thank you!`,
        }),
      });
    } catch (smsError) {
      console.error("Failed to send SMS confirmation:", smsError);
      // Do not block the appointment creation if SMS fails
    }

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error("Secretary appointment POST error:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}