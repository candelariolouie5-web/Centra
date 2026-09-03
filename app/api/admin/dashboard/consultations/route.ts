import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all accepted and confirmed appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        status: {
          in: ['ACCEPTED', 'CONFIRMED'],
        },
      },
      select: {
        serviceType: true,
      },
    });

    // If no appointments, return default data
    if (appointments.length === 0) {
      return NextResponse.json({
        data: [
          { name: "Ear", value: 0 },
          { name: "Nose", value: 0 },
          { name: "Throat", value: 0 },
          { name: "Aesthetics", value: 0 },
        ],
        highestService: null,
        lowestService: null,
        totalBookings: 0,
      }, { status: 200 });
    }

    // Group by service type and count
    const serviceCounts: Record<string, number> = {};
    appointments.forEach((appointment: any) => {
      const service = appointment.serviceType;
      serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    });

    const totalBookings = appointments.length;

    // Calculate percentages and prepare data
    const consultationData = Object.entries(serviceCounts).map(([name, count]) => ({
      name,
      count,
      value: parseFloat(((count / totalBookings) * 100).toFixed(1)),
    }));

    // Sort by percentage to find highest and lowest
    const sortedByPercentage = [...consultationData].sort((a, b) => b.value - a.value);
    
    const highestService = sortedByPercentage[0] || null;
    const lowestService = sortedByPercentage[sortedByPercentage.length - 1] || null;

    // Ensure all service types are represented (even with 0)
    const allServices = ["Ear", "Nose", "Throat", "Aesthetics"];
    const completeData = allServices.map(service => {
      const existing = consultationData.find(d => d.name.toLowerCase() === service.toLowerCase());
      return existing || { name: service, count: 0, value: 0 };
    });

    // Sort to match the original order
    const orderedData = allServices.map(service => 
      completeData.find(d => d.name.toLowerCase() === service.toLowerCase())!
    );

    return NextResponse.json({
      data: orderedData.map(d => ({ name: d.name, value: d.value })),
      highestService: highestService ? { name: highestService.name, percentage: highestService.value } : null,
      lowestService: lowestService ? { name: lowestService.name, percentage: lowestService.value } : null,
      totalBookings,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching consultation data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}