import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SCHOOL_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { teacherId, classId, sectionId, subjectId } = body;

    if (!teacherId || !classId || !sectionId || !subjectId) {
      return NextResponse.json({ success: false, error: "All assignment parameters required" }, { status: 400 });
    }

    const schoolId = user.schoolId!;

    const currentYear = await prisma.academicYear.findFirst({
      where: { schoolId, isCurrent: true },
    });

    if (!currentYear) {
      return NextResponse.json({ success: false, error: "No active academic year" }, { status: 400 });
    }

    const assignment = await prisma.teacherAssignment.upsert({
      where: {
        teacherId_subjectId_classId_sectionId_academicYearId: {
          teacherId,
          subjectId,
          classId,
          sectionId,
          academicYearId: currentYear.id,
        },
      },
      create: {
        teacherId,
        subjectId,
        classId,
        sectionId,
        academicYearId: currentYear.id,
      },
      update: {},
      include: {
        subject: true,
        class: true,
        section: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: assignment,
      message: "Subject successfully assigned to faculty member",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
