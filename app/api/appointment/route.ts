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
   Exact Account Assignment:
   1st booking = ADMIN
   2nd booking = DOCTOR
   3rd booking = FULL
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

    if (patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: {
          id: true,
          name: true,
          email: true,
          age: true,
          phone: true,
        },
      });

      if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 400 });
      }

      const patientPhone = patient.phone ? normalizePhone(patient.phone) : undefined;
      const incomingPhone = sanitizedContactNumber || undefined;
      const mergedPhone = incomingPhone || patientPhone;

      // 🔥 FIX: Update the patient's phone if a new one is provided
      if (incomingPhone && incomingPhone !== patient.phone) {
        await prisma.patient.update({
          where: { id: patient.id },
          data: { phone: incomingPhone },
        });
        console.log("📝 Updated patient phone from:", patient.phone, "to:", incomingPhone);
      }

      finalPatientId = patient.id;
      finalUserId = null;
      finalFullName = name || patient.name || "Patient";
      finalEmail = bodyEmail || patient.email || "";
      finalAge = age ? parseInt(String(age), 10) : patient.age ?? undefined;
      finalContactNumber = mergedPhone;
    } else {
      // No patientId provided - create or find patient
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

      // 🔥 FIX: Better patient lookup - check by email AND phone
      let patient = await prisma.patient.findFirst({
        where: {
          OR: [
            {
              email: safeEmail,
            },
            {
              phone: sanitizedContactNumber,
            },
            {
              name: name,
            },
          ],
        },
      });

      if (!patient) {
        // Create new patient with phone number
        patient = await prisma.patient.create({
          data: {
            name: name,
            email: safeEmail || undefined,
            age: age ? parseInt(String(age), 10) : undefined,
            phone: sanitizedContactNumber, // 🔥 SAVE PHONE NUMBER
          },
        });
        console.log("📝 New patient created with phone:", sanitizedContactNumber);
      } else {
        // 🔥 FIX: Update existing patient with phone number if missing
        const updateData: any = {};
        if (patient.phone !== sanitizedContactNumber) {
          updateData.phone = sanitizedContactNumber;
        }
        if (patient.name !== name) {
          updateData.name = name;
        }
        if (patient.age !== (age ? parseInt(String(age), 10) : undefined)) {
          updateData.age = age ? parseInt(String(age), 10) : undefined;
        }
        if (!patient.email && safeEmail) {
          updateData.email = safeEmail;
        }

        if (Object.keys(updateData).length > 0) {
          patient = await prisma.patient.update({
            where: { id: patient.id },
            data: updateData,
          });
          console.log("📝 Patient updated with phone:", sanitizedContactNumber);
        }
      }

      finalPatientId = patient.id;
      finalUserId = session.user.id;
      finalFullName = name;
      finalEmail = safeEmail;
      finalAge = age ? parseInt(String(age), 10) : undefined;
      finalContactNumber = sanitizedContactNumber;
    }

    if (finalAge !== undefined && (isNaN(finalAge) || finalAge <= 0)) {
      return NextResponse.json({ error: "Invalid age" }, { status: 400 });
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

        return createdAppointment;
      },
      {
        isolationLevel: "Serializable",
      }
    );

    // ---------- SEND SMS CONFIRMATION ----------
    console.log("=" .repeat(50));
    console.log("📨 STARTING SMS SEND PROCESS");
    console.log("=" .repeat(50));

    try {
      // Check if we have a contact number
      if (!appointment.contactNumber) {
        console.log("❌ NO CONTACT NUMBER - Skipping SMS");
        console.log("Appointment data:", {
          id: appointment.id,
          fullName: appointment.fullName,
          contactNumber: appointment.contactNumber,
        });
      } else {
        console.log(`📱 Phone number found: ${appointment.contactNumber}`);
        console.log(`📱 Phone number length: ${appointment.contactNumber.length}`);
        
        // Check if phone number is valid PH format
        if (!isValidPHMobile(appointment.contactNumber)) {
          console.log(`❌ Invalid PH mobile format: ${appointment.contactNumber}`);
          console.log("Format should be: 09XXXXXXXXX (11 digits)");
        } else {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
          console.log(`📡 Base URL: ${baseUrl}`);
          
          const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          console.log(`📅 Formatted date: ${formattedDate}`);

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
          console.log("📤 SMS Payload:", JSON.stringify(smsPayload, null, 2));

          console.log(`📤 Sending request to: ${baseUrl}/api/sms/send`);
          
          const smsResponse = await fetch(`${baseUrl}/api/sms/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(smsPayload),
          });

          const smsData = await smsResponse.json();
          console.log("📨 SMS API Response Status:", smsResponse.status);
          console.log("📨 SMS API Response Body:", JSON.stringify(smsData, null, 2));

          if (!smsResponse.ok) {
            console.error("❌ SMS API returned error:", smsData);
          } else {
            console.log("✅ SMS sent successfully!");
          }
        }
      }
    } catch (smsError) {
      console.error("❌ Failed to send SMS confirmation:", smsError);
      // Do not block the appointment creation if SMS fails
    }

    console.log("=" .repeat(50));
    console.log("📨 SMS SEND PROCESS COMPLETE");
    console.log("=" .repeat(50));

    return NextResponse.json(
      {
        success: true,
        appointment,
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