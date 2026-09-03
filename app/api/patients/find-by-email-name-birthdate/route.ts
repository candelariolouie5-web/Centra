import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name") || "";
  const birthdate = request.nextUrl.searchParams.get("birthdate") || "";

  if (!name.trim() || name.trim().length < 2) {
    return NextResponse.json(
      { error: "Please enter your full name (at least 2 characters)" },
      { status: 400 }
    );
  }

  if (!birthdate.trim()) {
    return NextResponse.json(
      { error: "Please enter your birthdate" },
      { status: 400 }
    );
  }

  try {
    const birthDateObj = new Date(birthdate);
    if (isNaN(birthDateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid birthdate format. Please use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // ✅ HANAPIN GAMIT ANG NAME + BIRTHDATE LANG (HINDI NA KASAMA ANG EMAIL)
    const patient = await prisma.patient.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
        birthdate: birthDateObj,
      },
      select: {
        id: true,
        name: true,
        age: true,
        gender: true,
        phone: true,
        email: true,
        birthdate: true,
        address: true,
      },
    });

    if (patient) {
      return NextResponse.json({
        patient,
        found: true,
        message: "Patient found!",
      });
    } else {
      // Check kung may name na similar
      const nameExists = await prisma.patient.findFirst({
        where: {
          name: {
            contains: name.trim(),
            mode: "insensitive",
          },
        },
        select: { id: true, name: true },
      });

      if (nameExists) {
        return NextResponse.json({
          found: false,
          error: `We found a similar name "${nameExists.name}" but the birthdate doesn't match. Please check your name and birthdate.`,
        });
      }

      return NextResponse.json({
        found: false,
        error: `No record found for "${name.trim()}". Please register as a new patient.`,
      });
    }
  } catch (error) {
    console.error("Patient lookup error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}