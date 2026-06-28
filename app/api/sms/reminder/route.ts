import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Send 24-hour reminders (GET request - for daily cron job)
export async function GET() {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const startOfTomorrow = new Date(tomorrow);
    startOfTomorrow.setHours(0, 0, 0, 0);

    // Find appointments for tomorrow that are still active
    const appointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: startOfTomorrow,
          lte: tomorrow,
        },
        secretaryStatus: {
          notIn: ["COMPLETED", "CANCELLED", "NO_SHOW"],
        },
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    let sentCount = 0;
    let failedCount = 0;

    for (const appt of appointments) {
      if (!appt.contactNumber) {
        continue;
      }

      try {
        await fetch(`${baseUrl}/api/sms/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number: appt.contactNumber,
            templateId: "REMINDER_24H",
            variables: {
              name: appt.fullName,
              service: appt.serviceType,
              time: appt.appointmentTime,
            },
          }),
        });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send 24h reminder for ${appt.id}:`, error);
        failedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      sent: sentCount, 
      failed: failedCount,
      total: appointments.length 
    });
  } catch (error) {
    console.error("24h reminder error:", error);
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}

// Send 3-hour reminders (POST request - for hourly cron job)
export async function POST(req: NextRequest) {
  try {
    const { type } = await req.json();
    
    if (type !== '3hour') {
      return NextResponse.json(
        { error: "Invalid type. Use '3hour'" },
        { status: 400 }
      );
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: todayStart,
          lte: todayEnd,
        },
        secretaryStatus: {
          notIn: ["COMPLETED", "CANCELLED", "NO_SHOW"],
        },
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    let sentCount = 0;
    let failedCount = 0;

    for (const appt of appointments) {
      if (!appt.contactNumber) {
        continue;
      }

      const [timeStr, period] = appt.appointmentTime.split(' ');
      let [hours, minutes] = timeStr.split(':').map(Number);
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      const apptDateTime = new Date(appt.appointmentDate);
      apptDateTime.setHours(hours, minutes, 0, 0);
      
      const diffMs = apptDateTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours >= 2.5 && diffHours <= 3.5) {
        try {
          await fetch(`${baseUrl}/api/sms/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone_number: appt.contactNumber,
              templateId: "REMINDER_3H",
              variables: {
                name: appt.fullName,
                service: appt.serviceType,
                time: appt.appointmentTime,
              },
            }),
          });
          sentCount++;
        } catch (error) {
          console.error(`Failed to send 3h reminder for ${appt.id}:`, error);
          failedCount++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      sent: sentCount, 
      failed: failedCount,
      total: appointments.length 
    });
  } catch (error) {
    console.error("3h reminder error:", error);
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}