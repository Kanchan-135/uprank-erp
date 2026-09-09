import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const requestedChildId = searchParams.get("childId");

    // Get all children linked to this parent
    const relations = await prisma.parentStudent.findMany({
      where: { parentId: user.id },
      include: {
        student: {
          include: {
            profile: true,
            enrollments: {
              where: { status: "ENROLLED" },
              include: { class: true, section: true, academicYear: true },
            },
          },
        },
      },
    });

    if (relations.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          children: [],
          activeChild: null,
          metrics: null,
        },
      });
    }

    const children = relations.map((r) => ({
      id: r.student.id,
      name: `${r.student.profile?.firstName} ${r.student.profile?.lastName}`,
      rollNumber: r.student.enrollments[0]?.rollNumber || "N/A",
      className: r.student.enrollments[0]?.class.name || "N/A",
      sectionName: r.student.enrollments[0]?.section.name || "N/A",
      relationship: r.relationship,
      avatar: r.student.avatar,
    }));

    // Choose active child
    const activeChild = children.find((c) => c.id === requestedChildId) || children[0];

    // Fetch active child's stats
    const [attendances, feeInvoices, examResults, leaves, notices] = await Promise.all([
      prisma.attendance.findMany({
        where: { studentId: activeChild.id },
        orderBy: { date: "desc" },
      }),
      prisma.feeInvoice.findMany({
        where: { studentId: activeChild.id },
        include: { feeStructure: { include: { feeCategory: true } }, payments: true },
        orderBy: { dueDate: "desc" },
      }),
      prisma.examResult.findMany({
        where: { studentId: activeChild.id },
        include: {
          examSubject: {
            include: {
              subject: true,
              exam: true,
            },
          },
        },
        take: 5,
      }),
      prisma.leaveRequest.findMany({
        where: { studentId: activeChild.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.notice.findMany({
        where: {
          OR: [{ targetRole: "ALL" }, { targetRole: "PARENTS" }],
        },
        orderBy: { publishDate: "desc" },
        take: 3,
      }),
    ]);

    const totalDays = attendances.length;
    const presentDays = attendances.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    const totalBilled = feeInvoices.reduce((s, i) => s + i.amount, 0);
    const totalPaid = feeInvoices.reduce((s, i) => s + i.paidAmount, 0);
    const pendingDues = Math.max(0, totalBilled - totalPaid);
    const pendingInvoices = feeInvoices.filter((i) => i.status !== "PAID");
    const sortedPending = [...pendingInvoices].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const feeDueDate = sortedPending[0]?.dueDate || (feeInvoices[0]?.dueDate ?? null);

    return NextResponse.json({
      success: true,
      data: {
        children,
        activeChild,
        metrics: {
          attendancePercentage,
          totalLoggedDays: totalDays,
          totalFees: totalBilled,
          paidFees: totalPaid,
          dueFees: pendingDues,
          pendingDues,
          feeDueDate,
          unpaidInvoicesCount: pendingInvoices.length,
          activeLeavesCount: leaves.filter((l) => l.status === "PENDING").length,
        },
        recentAttendance: attendances.slice(0, 10),
        invoices: feeInvoices,
        examResults,
        leaves,
        notices,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
