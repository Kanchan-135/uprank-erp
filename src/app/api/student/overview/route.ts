import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const enrollment = await prisma.studentEnrollment.findFirst({
      where: { studentId: user.id, status: "ENROLLED" },
      include: {
        class: true,
        section: true,
        academicYear: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ success: false, error: "No active enrollment found" }, { status: 404 });
    }

    // Attendance stats
    const attendances = await prisma.attendance.findMany({
      where: { studentId: user.id },
      orderBy: { date: "desc" },
    });

    const totalDays = attendances.length;
    const presentDays = attendances.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    // Today's classes
    const daysArr = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const todayName = daysArr[new Date().getDay()];
    const todaySchedule = await prisma.timetableSlot.findMany({
      where: {
        classId: enrollment.classId,
        sectionId: enrollment.sectionId,
        dayOfWeek: todayName === "SUNDAY" || todayName === "SATURDAY" ? "MONDAY" : todayName,
      },
      include: {
        subject: true,
        teacher: { include: { profile: true } },
      },
      orderBy: { startTime: "asc" },
    });

    // Pending assignments
    const assignments = await prisma.assignment.findMany({
      where: {
        classId: enrollment.classId,
        sectionId: enrollment.sectionId,
      },
      include: {
        subject: true,
        submissions: {
          where: { studentId: user.id },
        },
      },
      orderBy: { dueDate: "asc" },
      take: 4,
    });

    // Pending fee dues
    const pendingInvoices = await prisma.feeInvoice.findMany({
      where: {
        studentId: user.id,
        status: { in: ["PENDING", "PARTIAL", "OVERDUE"] },
      },
    });
    const totalPendingDues = pendingInvoices.reduce((acc, inv) => acc + (inv.amount - inv.paidAmount), 0);

    // Notices
    const notices = await prisma.notice.findMany({
      where: {
        OR: [{ targetRole: "ALL" }, { targetRole: "STUDENTS" }],
      },
      orderBy: { publishDate: "desc" },
      take: 3,
    });

    return NextResponse.json({
      success: true,
      data: {
        student: {
          name: `${user.firstName} ${user.lastName}`,
          rollNumber: enrollment.rollNumber,
          className: enrollment.class.name,
          sectionName: enrollment.section.name,
          academicYear: enrollment.academicYear.name,
        },
        metrics: {
          attendancePercentage,
          totalPresentDays: presentDays,
          totalLoggedDays: totalDays,
          totalPendingDues,
          pendingAssignmentsCount: assignments.filter((a) => a.submissions.length === 0).length,
        },
        todaySchedule,
        assignments,
        notices,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
