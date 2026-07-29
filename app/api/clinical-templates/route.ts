import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET: Fetch templates for a specific anatomy
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const anatomy = searchParams.get("anatomy");

    if (!anatomy) {
      return NextResponse.json(
        { error: "Missing anatomy parameter" },
        { status: 400 }
      );
    }

    const templates = await prisma.clinicalTemplate.findMany({
      where: {
        userId: session.user.id,
        anatomy: anatomy,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching clinical templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create a new template
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { anatomy, name, findings } = body;

    if (!anatomy || !name || !findings) {
      return NextResponse.json(
        { error: "Missing required fields: anatomy, name, findings" },
        { status: 400 }
      );
    }

    const existing = await prisma.clinicalTemplate.findUnique({
      where: {
        userId_anatomy_name: {
          userId: session.user.id,
          anatomy,
          name,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Template with this name already exists" },
        { status: 409 }
      );
    }

    const template = await prisma.clinicalTemplate.create({
      data: {
        userId: session.user.id,
        anatomy,
        name,
        findings,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error creating clinical template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}