import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const schoolId = user.schoolId || (await prisma.school.findFirst())?.id;
    if (!schoolId) {
      return NextResponse.json({ success: false, error: "No school found" }, { status: 400 });
    }

    const [classes, subjects, academicYears] = await Promise.all([
      prisma.class.findMany({
        where: { schoolId },
        include: {
          sections: {
            include: {
              _count: { select: { enrollments: true } },
            },
          },
        },
      }),
      prisma.subject.findMany({
        where: { schoolId },
        include: {
          class: true,
        },
      }),
      prisma.academicYear.findMany({
        where: { schoolId },
        include: { terms: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        classes,
        subjects,
        academicYears,
      },
    });
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
    const { type, name, code, classId, capacity } = body;

    if (type === "CLASS") {
      const newClass = await prisma.class.create({
        data: {
          schoolId: user.schoolId!,
          name,
          code: code || name.replace(/\s+/g, "").toUpperCase(),
          capacity: capacity ? parseInt(capacity, 10) : 40,
          sections: {
            create: [{ name: "Section A", capacity: 35 }],
          },
        },
        include: { sections: true },
      });
      return NextResponse.json({ success: true, data: newClass });
    } else if (type === "SECTION") {
      const newSection = await prisma.section.create({
        data: {
          classId,
          name,
          capacity: capacity ? parseInt(capacity, 10) : 35,
        },
      });
      return NextResponse.json({ success: true, data: newSection });
    } else if (type === "SUBJECT") {
      const newSubject = await prisma.subject.create({
        data: {
          schoolId: user.schoolId!,
          classId: classId || null,
          name,
          code: code || name.substring(0, 4).toUpperCase(),
          type: body.subjectType || "CORE",
        },
      });
      return NextResponse.json({ success: true, data: newSubject });
    }

    return NextResponse.json({ success: false, error: "Invalid academic entity type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
