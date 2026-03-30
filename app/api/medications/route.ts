import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

function normalizeText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeNullableText(value: unknown) {
  const normalized = normalizeText(value);
  return normalized || null;
}

async function getAuthorizedUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 as const, user: null };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    return { error: "Unauthorized", status: 401 as const, user: null };
  }

  if (user.role !== "ADMIN" && user.role !== "DOCTOR") {
    return {
      error: "Forbidden: Admin or Doctor role required",
      status: 403 as const,
      user: null,
    };
  }

  return { error: null, status: 200 as const, user };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthorizedUser();

    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const q = normalizeText(searchParams.get("q"));
    const limitParam = Number(searchParams.get("limit") || "100");
    const take = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), 100)
      : 100;

    const medications = await prisma.medication.findMany({
      where: q
        ? {
            OR: [
              { generic: { contains: q, mode: "insensitive" } },
              { brandName: { contains: q, mode: "insensitive" } },
              { dosage: { contains: q, mode: "insensitive" } },
              { quantity: { contains: q, mode: "insensitive" } },
              { instructions: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: [{ generic: "asc" }, { brandName: "asc" }, { createdAt: "desc" }],
      take,
      select: {
        id: true,
        generic: true,
        brandName: true,
        quantity: true,
        dosage: true,
        instructions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ medications });
  } catch (error) {
    console.error("[MEDICATIONS-GET-ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch medications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthorizedUser();

    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    const generic = normalizeText(body?.generic);
    const brandName = normalizeNullableText(body?.brandName);
    const quantity = normalizeNullableText(body?.quantity);
    const dosage = normalizeNullableText(body?.dosage);
    const instructions = normalizeNullableText(body?.instructions);

    if (!generic) {
      return NextResponse.json(
        { error: "Generic is required" },
        { status: 400 }
      );
    }

    const existingMedication = await prisma.medication.findFirst({
      where: {
        generic: { equals: generic, mode: "insensitive" },
        brandName: brandName
          ? { equals: brandName, mode: "insensitive" }
          : null,
        quantity: quantity
          ? { equals: quantity, mode: "insensitive" }
          : null,
        dosage: dosage
          ? { equals: dosage, mode: "insensitive" }
          : null,
        instructions: instructions
          ? { equals: instructions, mode: "insensitive" }
          : null,
      },
      select: {
        id: true,
        generic: true,
        brandName: true,
        quantity: true,
        dosage: true,
        instructions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (existingMedication) {
      return NextResponse.json({
        message: "Medication already exists",
        medication: existingMedication,
      });
    }

    const medication = await prisma.medication.create({
      data: {
        generic,
        brandName,
        quantity,
        dosage,
        instructions,
      },
      select: {
        id: true,
        generic: true,
        brandName: true,
        quantity: true,
        dosage: true,
        instructions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Medication saved successfully",
        medication,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[MEDICATIONS-POST-ERROR]", error);
    return NextResponse.json(
      { error: "Failed to save medication" },
      { status: 500 }
    );
  }
}
