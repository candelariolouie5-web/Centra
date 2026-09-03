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
      birthdate,
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

    if (parsedAge !== undefined && (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 999)) {
      return NextResponse.json(
        { error: "Invalid age (must be between 1 and 999)" },
        { status: 400 }
      );
    }

    // ============================================================
    // 🔍 CASE 1: MAY patientId → RETURNING PATIENT
    // ============================================================
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
          birthdate: true,
        },
      });

      if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 400 });
      }

      finalPatientId = patient.id;
      finalUserId = null;
      finalFullName = patient.name || "";
      finalEmail = patient.email || "";
      finalAge = patient.age ?? undefined;
      finalContactNumber = patient.phone || undefined;

      if (sanitizedContactNumber && sanitizedContactNumber !== patient.phone) {
        finalContactNumber = sanitizedContactNumber;
        console.log(`📝 Using new contact for appointment: ${sanitizedContactNumber}`);
      }

      // ============================================================
      // 🟢 BAGONG LOGIC: Hanapin ang COMPLETED appointment ng patient
      // ============================================================
      // Hanapin ang latest COMPLETED appointment ng patient
      const completedAppointment = await prisma.appointment.findFirst({
        where: {
          patientId: patient.id,
          status: "COMPLETED",
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          status: true,
          appointmentDate: true,
        },
      });

      // ✅ Kung may COMPLETED appointment, i-update ito sa CONFIRMED
      //    at gamitin ang appointment ID na iyon (huwag gumawa ng bago)
      let createdAppointment;

      if (completedAppointment) {
        console.log(`🔄 Found COMPLETED appointment: ${completedAppointment.id}`);

        // ✅ I-update ang COMPLETED appointment → CONFIRMED
        createdAppointment = await prisma.appointment.update({
          where: { id: completedAppointment.id },
          data: {
            status: "CONFIRMED",
            appointmentDate: new Date(`${date}T${time}`),
            appointmentTime: time,
            serviceType: serviceType,
            // I-update din ang ibang fields kung kinakailangan
            fullName: finalFullName,
            age: finalAge,
            contactNumber: finalContactNumber,
            email: finalEmail,
            room: room || undefined,
          },
          include: {
            patient: true,
          },
        });

        console.log(`✅ Updated COMPLETED appointment to CONFIRMED: ${createdAppointment.id}`);

        // ============================================================
        // 📨 SMS SEND (for updated appointment)
        // ============================================================
        console.log("=".repeat(50));
        console.log("📨 STARTING SMS SEND PROCESS (UPDATED APPOINTMENT)");
        console.log("=".repeat(50));

        try {
          if (createdAppointment.contactNumber) {
            if (isValidPHMobile(createdAppointment.contactNumber)) {
              const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

              const formattedDate = new Date(createdAppointment.appointmentDate).toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              const smsPayload = {
                phone_number: createdAppointment.contactNumber,
                templateId: "BOOKING_CONFIRMATION",
                variables: {
                  name: createdAppointment.fullName,
                  service: createdAppointment.serviceType,
                  date: formattedDate,
                  time: createdAppointment.appointmentTime,
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

        console.log("=".repeat(50));
        console.log("📨 SMS SEND PROCESS COMPLETE");
        console.log("=".repeat(50));

        return NextResponse.json(
          {
            success: true,
            appointment: createdAppointment,
            message: "Your existing appointment has been rescheduled.",
            isRescheduled: true,
          },
          { status: 200 }
        );
      }

      // ❌ Walang COMPLETED appointment — gumawa ng bago
      console.log(`📝 No COMPLETED appointment found for patient ${patient.id}. Creating new appointment.`);

    // ============================================================
    // CASE 2: WALANG patientId → NEW PATIENT (laging gumawa ng bago)
    // ============================================================
    } else {
      if (!name || !sanitizedContactNumber) {
        return NextResponse.json(
          { error: "name, contactNumber required for booking" },
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
      const parsedBirthdate = birthdate ? new Date(birthdate) : null;
      const isValidBirthdate = parsedBirthdate && !isNaN(parsedBirthdate.getTime());

      // ✅ GUMAWA NG BAGONG PATIENT
      const patient = await prisma.patient.create({
        data: {
          name: name.trim(),
          email: safeEmail || undefined,
          age: parsedAge,
          phone: sanitizedContactNumber,
          gender: gender?.trim() || undefined,
          birthdate: isValidBirthdate ? parsedBirthdate : undefined,
        },
      });

      console.log(`✅ New patient created: ${patient.name} (ID: ${patient.id})`);

      finalPatientId = patient.id;
      finalUserId = session.user.id;
      finalFullName = patient.name;
      finalEmail = patient.email || "";
      finalAge = patient.age ?? undefined;
      finalContactNumber = patient.phone || undefined;
    }

    // ============================================================
    // 📅 CREATE NEW APPOINTMENT (for new patients OR returning without COMPLETED)
    // ============================================================
    // (Nandito lang ang code kung walang COMPLETED appointment na na-update)

    // Continue with normal appointment creation...
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
        console.log(`👤 Patient: ${finalFullName} (ID: ${finalPatientId})`);

        return createdAppointment;
      },
      {
        isolationLevel: "Serializable",
      }
    );

    // ============================================================
    // 📨 SMS SEND (for new appointment)
    // ============================================================
    console.log("=".repeat(50));
    console.log("📨 STARTING SMS SEND PROCESS");
    console.log("=".repeat(50));

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

    console.log("=".repeat(50));
    console.log("📨 SMS SEND PROCESS COMPLETE");
    console.log("=".repeat(50));

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