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
        status: {
          in: ["PENDING", "CONFIRMED", "ACCEPTED"],
        },
        patientId: {
          not: null,
        },
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

    const latestPerPatient = new Map<string, (typeof appointments)[number]>();

    for (const appointment of appointments) {
      if (!appointment.patientId || !appointment.patient) continue;

      if (!latestPerPatient.has(appointment.patientId)) {
        latestPerPatient.set(appointment.patientId, appointment);
      }
    }

    const transformedPatients = Array.from(latestPerPatient.values()).map(
      (appt) => {
        const patient = appt.patient!;
        const latestSoapNote = patient.soapNotes?.[0] ?? null;

        return {
          id: patient.id,
          name: patient.name || appt.fullName || "N/A",
          email: patient.email || appt.email || null,
          image: null,
          createdAt: patient.createdAt.toISOString(),
          chiefComplaints: latestSoapNote?.chiefComplaint || null,
          remarks: latestSoapNote?.remarks || null,
          notes: latestSoapNote?.diagnosis || null,
          soapNote: latestSoapNote,
        };
      }
    );

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
      emergencyName,
      emergencyRelationship,
      emergencyPhone,
      emergencyAltPhone,
      physicianName,
      physicianClinic,
      physicianPhone,
      physicianEmail,
      consent,
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