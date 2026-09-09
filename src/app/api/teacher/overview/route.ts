import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "TEACHER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const [assignments, mySlots, pendingGrading, recentNotices, teacherRecord] = await Promise.all([
      prisma.teacherAssignment.findMany({
        where: { teacherId: user.id },
        include: {
          class: true,
          section: true,
          subject: true,
        },
      }),
      prisma.timetableSlot.findMany({
        where: { teacherId: user.id },
        include: {
          class: true,
          section: true,
          subject: true,
        },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      }),
      prisma.assignmentSubmission.count({
        where: {
          assignment: { teacherId: user.id },
          status: "SUBMITTED",
        },
      }),
      prisma.notice.findMany({
        where: {
          OR: [{ targetRole: "ALL" }, { targetRole: "TEACHERS" }],
        },
        orderBy: { publishDate: "desc" },
        take: 3,
      }),
      prisma.user.findUnique({
        where: { id: user.id },
        include: { primaryClass: true, primarySection: true },
      }),
    ]);

    // Compute today's day
    const daysArr = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const todayName = daysArr[new Date().getDay()];
    const todaySchedule = mySlots.filter((s) => s.dayOfWeek === todayName);

    return NextResponse.json({
      success: true,
      data: {
        assignedClasses: assignments,
        todaySchedule: todaySchedule.length > 0 ? todaySchedule : mySlots.slice(0, 3),
        totalSlots: mySlots.length,
        pendingGradingCount: pendingGrading,
        recentNotices,
        primaryClass: teacherRecord?.primaryClass || null,
        primarySection: teacherRecord?.primarySection || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
