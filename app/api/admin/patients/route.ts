import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Get distinct patients from appointments (people who booked appointments)
    const patients = await prisma.appointment.findMany({
      select: {
        userId: true,
        fullName: true,
        email: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            createdAt: true,
            soapNotes: {
              orderBy: { createdAt: "desc" },
              take: 1, // Get the latest SOAP note
              select: {
                chiefComplaint: true,
                remarks: true,
                historyOfIllness: true, // Assuming notes might be here, or add a notes field if needed
                // Attachments not in schema, perhaps add later
              },
            },
          },
        },
      },
      distinct: ["userId"],
      orderBy: { createdAt: "desc" },
    });

    // Transform to match the expected format
    const transformedPatients = patients.map((appointment) => {
      const latestSoapNote = appointment.user?.soapNotes?.[0];
      return {
        id: appointment.userId,
        name: appointment.fullName || appointment.user?.name || "N/A",
        email: appointment.email,
        image: appointment.user?.image,
        createdAt: appointment.user?.createdAt || new Date(),
        chiefComplaints: latestSoapNote?.chiefComplaint || null,
        remarks: latestSoapNote?.remarks || null,
        notes: latestSoapNote?.historyOfIllness || null, // Assuming notes is historyOfIllness, adjust if needed
        attachments: [], // Placeholder, implement file handling later if needed
      };
    });

    return NextResponse.json({ patients: transformedPatients });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { fullName, email, age, gender, phone, address, emergencyName, emergencyRelationship, emergencyPhone, emergencyAltPhone, physicianName, physicianClinic, physicianPhone, physicianEmail, consent } = body;

    // Validate required fields
    if (!fullName || !email || !age || !gender || !phone || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          name: fullName,
          email,
          role: "USER" as any,
          image: null,
          updatedAt: new Date(),
        },
      });
      userId = newUser.id;
    }

    // Create a placeholder appointment to register the patient
    // This ensures the patient appears in the patients list
    await prisma.appointment.create({
      data: {
        userId,
        fullName,
        email,
        appointmentDate: new Date(),
        appointmentTime: "00:00",
        serviceType: "Patient Registration",
        status: "ACCEPTED" as any,
      },
    });

    return NextResponse.json({ success: true, message: "Patient created successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
  }
}
