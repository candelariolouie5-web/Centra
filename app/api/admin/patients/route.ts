import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, isActive: true },
  });

  if (!user || user.role !== "ADMIN" || !user.isActive) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        assignedToRole: "ADMIN",
        assignedToUserId: user.id,
        patientId: { not: null },
      },
      include: {
        patient: {
          include: {
            soapNotes: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                id: true,
                chiefComplaint: true,
                historyOfIllness: true,
                remarks: true,
                diagnosis: true,
                plan: true,
                followUp: true,
                imageData: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: [{ appointmentDate: "desc" }, { createdAt: "desc" }],
    });

    const sortedAppointments = [...appointments].sort((a, b) => {
      const aDate = a.appointmentDate instanceof Date ? a.appointmentDate : new Date(a.appointmentDate);
      const bDate = b.appointmentDate instanceof Date ? b.appointmentDate : new Date(b.appointmentDate);
      const diff = bDate.getTime() - aDate.getTime();
      if (diff !== 0) return diff;
      const aCreated = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const bCreated = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return bCreated.getTime() - aCreated.getTime();
    });

    const latestPerPatient = new Map<string, (typeof appointments)[number]>();
    for (const appt of sortedAppointments) {
      if (!appt.patientId || !appt.patient) continue;
      if (!latestPerPatient.has(appt.patientId)) {
        latestPerPatient.set(appt.patientId, appt);
      }
    }

    const today = new Date();
    const todayY = today.getFullYear();
    const todayM = today.getMonth();
    const todayD = today.getDate();

    const hasTodayAppointment = new Set<string>();
    for (const a of appointments) {
      if (!a.patientId) continue;
      const d = a.appointmentDate instanceof Date ? a.appointmentDate : new Date(a.appointmentDate);
      if (d.getFullYear() === todayY && d.getMonth() === todayM && d.getDate() === todayD) {
        hasTodayAppointment.add(a.patientId);
      }
    }

    const transformedPatients = Array.from(latestPerPatient.values()).map((appt) => {
      const patient = appt.patient!;
      const latestSoapNote = patient.soapNotes?.[0] ?? null;
      return {
        id: patient.id,
        name: patient.name || appt.fullName || "N/A",
        email: patient.email || appt.email || null,
        phone: patient.phone || null,
        age: patient.age || null,
        gender: patient.gender || null,
        address: patient.address || null,
        image: null,
        createdAt: patient.createdAt.toISOString(),
        chiefComplaints: latestSoapNote?.chiefComplaint || null,
        remarks: latestSoapNote?.remarks || null,
        notes: latestSoapNote?.diagnosis || null,
        soapNote: latestSoapNote,
        latestAppointmentStatus: appt.status ?? null,
        hasTodayAppointment: hasTodayAppointment.has(patient.id),
      };
    });

    return NextResponse.json({ patients: transformedPatients });
  } catch (error) {
    console.error("Admin patients GET error:", error);
    return NextResponse.json({ patients: [] }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, isActive: true },
  });

  if (!user || user.role !== "ADMIN" || !user.isActive) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      fullName,
      email,
      age,
      gender,
      phone,
      address,
    } = body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName || !email || !age || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: fullName, email, age, phone" },
        { status: 400 }
      );
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const patient = await prisma.patient.create({
      data: {
        name: fullName,
        email,
        age: Number(age),
        phone: phone || null,
        gender: gender || null,
        address: address || null,
      },
    });

    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        assignedToUserId: user.id,
        assignedToRole: "ADMIN",
        fullName,
        email,
        age: Number(age),
        contactNumber: phone,
        appointmentDate: new Date(),
        appointmentTime: "00:00",
        serviceType: "Patient Registration",
        status: "ACCEPTED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Patient created successfully",
    });
  } catch (error) {
    console.error("Admin patients POST error:", error);
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
  }
}