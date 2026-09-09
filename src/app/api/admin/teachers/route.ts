import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SCHOOL_ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const schoolId = user.schoolId || (await prisma.school.findFirst())?.id;
    if (!schoolId) {
      return NextResponse.json({ success: false, error: "No school found" }, { status: 400 });
    }

    const teachers = await prisma.user.findMany({
      where: { schoolId, role: "TEACHER" },
      include: {
        profile: true,
        primaryClass: true,
        primarySection: true,
        teacherAssignments: {
          include: {
            class: true,
            section: true,
            subject: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: teachers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SCHOOL_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, designation, qualification, gender, primaryClassId, primarySectionId } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ success: false, error: "Missing required teacher fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 400 });
    }

    const defaultPassword = await hashPassword("password123");

    const teacher = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash: defaultPassword,
        role: "TEACHER",
        schoolId: user.schoolId!,
        primaryClassId: primaryClassId || null,
        primarySectionId: primarySectionId || null,
        profile: {
          create: {
            firstName,
            lastName,
            phone,
            gender,
            designation: designation || "Faculty Member",
            qualification: qualification || "Degree in Education",
          },
        },
      },
      include: {
        profile: true,
        primaryClass: true,
        primarySection: true,
      },
    });

    return NextResponse.json({ success: true, data: teacher }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SCHOOL_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { teacherId, primaryClassId, primarySectionId, designation, qualification, phone } = body;

    if (!teacherId) {
      return NextResponse.json({ success: false, error: "Teacher ID is required" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: teacherId },
      data: {
        primaryClassId: primaryClassId || null,
        primarySectionId: primarySectionId || null,
        profile: {
          update: {
            ...(designation !== undefined ? { designation } : {}),
            ...(qualification !== undefined ? { qualification } : {}),
            ...(phone !== undefined ? { phone } : {}),
          },
        },
      },
      include: {
        profile: true,
        primaryClass: true,
        primarySection: true,
        teacherAssignments: {
          include: {
            class: true,
            section: true,
            subject: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Teacher assignments and class teacher designation updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
