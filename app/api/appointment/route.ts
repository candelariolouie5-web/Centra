import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma, getActiveDoctorCount } from "@/lib/prisma";

/* ===============================
   USER → CREATE APPOINTMENT
================================ */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date, time, name, age, contactNumber, serviceType } = await request.json();

    if (!session.user.email) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 });
    }

    const ageNum = parseInt(age);
    if (!date || !time || !name || !contactNumber || !serviceType || isNaN(ageNum) || ageNum <= 0) {
      return NextResponse.json({ error: "Missing required fields or invalid age" }, { status: 400 });
    }

    const email = session.user.email;

    const appointmentDateTime = new Date(`${date}T${time}`);

    // Prevent same-day appointments (earliest = tomorrow)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (appointmentDateTime < tomorrow) {
      return NextResponse.json({ error: "Same-day appointments are not allowed. Please select a date from tomorrow onwards." }, { status: 400 });
    }

    // Check if the selected date is within a blocked date range
    const blockedDate = await prisma.blockedDate.findFirst({
      where: {
        startDate: {
          lte: appointmentDateTime,
        },
        endDate: {
          gte: appointmentDateTime,
        },
      },
    });

    if (blockedDate) {
      return NextResponse.json(
        { error: "Doctor is unavailable on selected date. Please choose another date." },
        { status: 400 }
      );
    }

    // Get active doctor count (capacity)
    const activeDoctors = await getActiveDoctorCount();

    if (activeDoctors === 0) {
      return NextResponse.json({ error: "No active doctors available. Please contact admin." }, { status: 400 });
    }

    // Check booking count for slot
    const dateStart = new Date(date + 'T00:00:00');
    const dateEnd = new Date(date + 'T23:59:59');
    const bookedCount = await prisma.appointment.count({
      where: {
        appointmentDate: {
          gte: dateStart,
          lt: dateEnd
        },
        appointmentTime: time,
        status: {
          in: ["PENDING", "CONFIRMED"]
        }
      }
    });

    if (bookedCount >= activeDoctors) {
      return NextResponse.json({ error: `This time slot is full (${bookedCount}/${activeDoctors} booked). Please select another time.` }, { status: 400 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: session.user.id,
        fullName: name,
        age: parseInt(age),
        contactNumber,
        email,
        serviceType,
        appointmentDate: appointmentDateTime,
        appointmentTime: time,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ===============================
   USER → VIEW OWN APPOINTMENTS
================================ */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

