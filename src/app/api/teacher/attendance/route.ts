import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "TEACHER" && user.role !== "SCHOOL_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const sectionId = searchParams.get("sectionId");
    const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];

    if (!classId || !sectionId) {
      return NextResponse.json({ success: false, error: "Class and section required" }, { status: 400 });
    }

    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Get all enrolled students in this class/section
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        classId,
        sectionId,
        status: "ENROLLED",
      },
      include: {
        student: {
          include: { profile: true },
        },
      },
      orderBy: { rollNumber: "asc" },
    });

    // Get existing attendance records for this date
    const existingRecords = await prisma.attendance.findMany({
      where: {
        classId,
        sectionId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const recordMap = new Map<string, (typeof existingRecords)[0]>();
    existingRecords.forEach((r) => recordMap.set(r.studentId, r));

    const roster = enrollments.map((e) => {
      const rec = recordMap.get(e.studentId);
      return {
        studentId: e.student.id,
        rollNumber: e.rollNumber,
        firstName: e.student.profile?.firstName || "Student",
        lastName: e.student.profile?.lastName || "",
        status: rec?.status || "PRESENT",
        remarks: rec?.remarks || "",
        isSaved: !!rec,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        date: dateStr,
        isMarked: existingRecords.length > 0,
        roster,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "TEACHER" && user.role !== "SCHOOL_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { classId, sectionId, date, records } = body;

    if (!classId || !sectionId || !records || !Array.isArray(records)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const parsedDate = new Date(date || new Date());
    const dateAtNoon = new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 12, 0, 0));

    for (const item of records) {
      // Find if record exists for this student on this day
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existing = await prisma.attendance.findFirst({
        where: {
          studentId: item.studentId,
          date: { gte: startOfDay, lte: endOfDay },
        },
      });

      if (existing) {
        await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            status: item.status,
            remarks: item.remarks || null,
            markedById: user.id,
          },
        });
      } else {
        await prisma.attendance.create({
          data: {
            studentId: item.studentId,
            classId,
            sectionId,
            date: dateAtNoon,
            status: item.status,
            remarks: item.remarks || null,
            markedById: user.id,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully saved attendance for ${records.length} students.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
