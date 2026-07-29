import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import {
  prisma,
  BUSY_APPOINTMENT_STATUSES,
  findFirstFreeAssigneeForSlot,
  getAvailabilityForSlot,
  getDayRange,
} from "@/lib/prisma";

/* ===============================
   HELPERS
================================ */
function normalizePhone(value: unknown) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 11);
}

function isValidPHMobile(value: string) {
  return /^09\d{9}$/.test(value);
}

/* ===============================
   SHARED → CREATE APPOINTMENT (Users/Staff/Clinical/Soap)
================================ */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("📝 Full request body:", body);

    const isStaffSession =
      session.user.role === "ADMIN" || session.user.role === "DOCTOR";

    const rawSource =
      typeof body?.source === "string" ? body.source.trim().toLowerCase() : "";

    const normalizedSource =
      rawSource === "staff" ||
      rawSource === "clinical" ||
      rawSource === "soap" ||
      rawSource === "admin" ||
      rawSource === "doctor"
        ? "staff"
        : rawSource === "user"
          ? "user"
          : undefined;

    const {
      date,
      time,
      serviceType,
      patientId,
      name,
      age,
      contactNumber,
      email: bodyEmail,
      room,
      gender,
    } = body;

    const source = normalizedSource ?? (isStaffSession ? "staff" : "user");

    if (!date || !time || !serviceType) {
      return NextResponse.json(
        { error: "date, time, serviceType required" },
        { status: 400 }
      );
    }

    const sanitizedContactNumber = normalizePhone(contactNumber);
    console.log("📱 Sanitized contact number:", sanitizedContactNumber);

    let finalPatientId: string;
    let finalUserId: string | null = null;
    let finalFullName: string;
    let finalEmail: string;
    let finalAge: number | undefined;
    let finalContactNumber: string | undefined;

    const parsedAge = age ? parseInt(String(age), 10) : undefined;
    
    // ✅ AGE VALIDATION: Must be between 1 and 999
    if (parsedAge !== undefined && (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 999)) {
      return NextResponse.json(
        { error: "Invalid age (must be between 1 and 999)" },
        { status: 400 }
      );
    }

    if (patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: {
          id: true,
          name: true,
          email: true,
          age: true,
          phone: true,
          gender: true,
          address: true,
        },
      });

      if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 400 });
      }

      const patientPhone = patient.phone ? normalizePhone(patient.phone) : undefined;
      const incomingPhone = sanitizedContactNumber || undefined;
      const mergedPhone = incomingPhone || patientPhone;

      const updateData: any = {};
      
      if (name && name.trim() !== patient.name) {
        updateData.name = name.trim();
      }
      
      if (bodyEmail && bodyEmail.trim() !== patient.email) {
        updateData.email = bodyEmail.trim();
      }
      
      if (parsedAge !== undefined && parsedAge !== patient.age) {
        updateData.age = parsedAge;
        console.log(`📝 Updating age from ${patient.age} to ${parsedAge}`);
      }
      
      if (incomingPhone && incomingPhone !== patient.phone) {
        updateData.phone = incomingPhone;
        console.log(`📝 Updating phone from ${patient.phone} to ${incomingPhone}`);
      }

      if (gender && gender.trim() !== patient.gender) {
        updateData.gender = gender.trim();
        console.log(`📝 Updating gender from ${patient.gender} to ${gender.trim()}`);
      }

      if (Object.keys(updateData).length > 0) {
        const updatedPatient = await prisma.patient.update({
          where: { id: patient.id },
          data: updateData,
        });
        console.log(`✅ Auto-synced patient ${patient.id} with:`, updateData);
        
        finalFullName = updateData.name || patient.name || "Patient";
        finalEmail = updateData.email || patient.email || "";
        finalAge = updateData.age ?? patient.age ?? undefined;
        finalContactNumber = updateData.phone || mergedPhone;
      } else {
        finalFullName = name || patient.name || "Patient";
        finalEmail = bodyEmail || patient.email || "";
        finalAge = parsedAge ?? patient.age ?? undefined;
        finalContactNumber = mergedPhone;
      }

      finalPatientId = patient.id;
      finalUserId = null;
      
      console.log(`📝 Final values - Name: ${finalFullName}, Age: ${finalAge}, Phone: ${finalContactNumber}`);

    } else {
      if (!name || !sanitizedContactNumber) {
        return NextResponse.json(
          { error: "name, contactNumber required for self-booking" },
          { status: 400 }
        );
      }

      if (!isValidPHMobile(sanitizedContactNumber)) {
        return NextResponse.json(
          { error: "Contact number must be a valid 11-digit PH mobile number (09XXXXXXXXX)" },
          { status: 400 }
        );
      }

      const safeEmail = session.user.email || bodyEmail || "";

      let patient = await prisma.patient.findFirst({
        where: {
          OR: [
            { email: safeEmail },
            { phone: sanitizedContactNumber },
            { name: name },
          ],
        },
      });

      if (!patient) {
        patient = await prisma.patient.create({
          data: {
            name: name.trim(),
            email: safeEmail || undefined,
            age: parsedAge,
            phone: sanitizedContactNumber,
            gender: gender?.trim() || undefined,
          },
        });
        console.log(`📝 New patient created with name: ${name}, age: ${parsedAge}, phone: ${sanitizedContactNumber}, gender: ${gender || 'not provided'}`);
      } else {
        const updateData: any = {};
        
        if (patient.phone !== sanitizedContactNumber) {
          updateData.phone = sanitizedContactNumber;
        }
        if (patient.name !== name.trim()) {
          updateData.name = name.trim();
        }
        if (parsedAge !== undefined && patient.age !== parsedAge) {
          updateData.age = parsedAge;
        }
        if (!patient.email && safeEmail) {
          updateData.email = safeEmail;
        }
        if (gender && gender.trim() !== patient.gender) {
          updateData.gender = gender.trim();
        }

        if (Object.keys(updateData).length > 0) {
          patient = await prisma.patient.update({
            where: { id: patient.id },
            data: updateData,
          });
          console.log(`📝 Updated patient ${patient.id} with:`, updateData);
        }
      }

      finalPatientId = patient.id;
      finalUserId = session.user.id;
      finalFullName = name.trim();
      finalEmail = safeEmail;
      finalAge = parsedAge ?? patient.age ?? undefined;
      finalContactNumber = sanitizedContactNumber;
    }

    if (finalAge !== undefined && (isNaN(finalAge) || finalAge <= 0 || finalAge > 999)) {
      return NextResponse.json(
        { error: "Invalid age (must be between 1 and 999)" },
        { status: 400 }
      );
    }

    if (source === "user") {
      if (!finalContactNumber) {
        return NextResponse.json(
          { error: "Contact number is required" },
          { status: 400 }
        );
      }

      if (!isValidPHMobile(finalContactNumber)) {
        return NextResponse.json(
          { error: "Contact number must be a valid 11-digit PH mobile number (09XXXXXXXXX)" },
          { status: 400 }
        );
      }
    }

    const appointmentDateTime = new Date(`${date}T${time}`);

    if (isNaN(appointmentDateTime.getTime())) {
      return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
    }

    if (source === "user") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      if (appointmentDateTime < tomorrow) {
        return NextResponse.json(
          { error: "Same-day appointments not allowed for self-booking" },
          { status: 400 }
        );
      }
    }

    const appointment = await prisma.$transaction(
      async (tx) => {
        const slotInfo = await getAvailabilityForSlot(date, time, tx);

        if (slotInfo.remaining <= 0 || slotInfo.capacity <= 0) {
          const error = new Error("SLOT_FULL");
          (error as any).code = "SLOT_FULL";
          throw error;
        }

        const assignee = await findFirstFreeAssigneeForSlot(date, time, tx);

        if (!assignee) {
          const error = new Error("SLOT_FULL");
          (error as any).code = "SLOT_FULL";
          throw error;
        }

        const { start, end } = getDayRange(date);

        const duplicateForSameExactAccount = await tx.appointment.findFirst({
          where: {
            appointmentDate: {
              gte: start,
              lte: end,
            },
            appointmentTime: time,
            assignedToUserId: assignee.assignedToUserId,
            status: {
              in: [...BUSY_APPOINTMENT_STATUSES],
            },
          },
          select: { id: true },
        });

        if (duplicateForSameExactAccount) {
          const error = new Error("SLOT_FULL");
          (error as any).code = "SLOT_FULL";
          throw error;
        }

        const createdAppointment = await tx.appointment.create({
          data: {
            patientId: finalPatientId,
            userId: finalUserId,
            fullName: finalFullName,
            age: finalAge,
            contactNumber: finalContactNumber,
            email: finalEmail,
            serviceType,
            appointmentDate: appointmentDateTime,
            appointmentTime: time,
            room,
            source,
            status: "CONFIRMED",
            assignedToRole: assignee.assignedToRole,
            assignedToUserId: assignee.assignedToUserId,
            createdByRole: session.user.role || "USER",
          },
        });

        console.log("✅ Appointment created with ID:", createdAppointment.id);
        console.log("📱 Contact number saved to appointment:", createdAppointment.contactNumber);
        console.log("📅 Age saved to appointment:", createdAppointment.age);

        return createdAppointment;
      },
      {
        isolationLevel: "Serializable",
      }
    );

    console.log("=" .repeat(50));
    console.log("📨 STARTING SMS SEND PROCESS");
    console.log("=" .repeat(50));

    try {
      if (!appointment.contactNumber) {
        console.log("❌ NO CONTACT NUMBER - Skipping SMS");
      } else {
        console.log(`📱 Phone number found: ${appointment.contactNumber}`);
        
        if (!isValidPHMobile(appointment.contactNumber)) {
          console.log(`❌ Invalid PH mobile format: ${appointment.contactNumber}`);
        } else {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
          
          const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          const smsPayload = {
            phone_number: appointment.contactNumber,
            templateId: "BOOKING_CONFIRMATION",
            variables: {
              name: appointment.fullName,
              service: appointment.serviceType,
              date: formattedDate,
              time: appointment.appointmentTime,
            },
          };

          const smsResponse = await fetch(`${baseUrl}/api/sms/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(smsPayload),
          });

          if (!smsResponse.ok) {
            console.error("❌ SMS API returned error:", await smsResponse.text());
          } else {
            console.log("✅ SMS sent successfully!");
          }
        }
      }
    } catch (smsError) {
      console.error("❌ Failed to send SMS confirmation:", smsError);
    }

    console.log("=" .repeat(50));
    console.log("📨 SMS SEND PROCESS COMPLETE");
    console.log("=" .repeat(50));

    return NextResponse.json(
      {
        success: true,
        appointment,
        patientSynced: true,
        message:
          source === "user"
            ? "Your appointment is confirmed"
            : "Appointment scheduled successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating appointment:", error);

    if (error?.code === "SLOT_FULL" || error?.message === "SLOT_FULL") {
      return NextResponse.json(
        { error: "No available slots" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "Failed to create appointment" },
      { status: 500 }
    );
  }
}

/* ===============================
   USER → VIEW OWN APPOINTMENTS
================================ */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { userId: session.user.id },
      include: {
        patient: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}