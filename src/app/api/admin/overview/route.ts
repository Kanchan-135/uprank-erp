import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SCHOOL_ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const schoolId = user.schoolId;
    if (!schoolId) {
      return NextResponse.json({ success: false, error: "No school associated" }, { status: 400 });
    }

    const [studentsCount, teachersCount, classesCount, feeSum, paidFeeSum, recentNotices, recentStudents] = await Promise.all([
      prisma.studentEnrollment.count({ where: { class: { schoolId }, status: "ENROLLED" } }),
      prisma.user.count({ where: { schoolId, role: "TEACHER" } }),
      prisma.class.count({ where: { schoolId } }),
      prisma.feeInvoice.aggregate({
        where: { schoolId },
        _sum: { amount: true },
      }),
      prisma.feeInvoice.aggregate({
        where: { schoolId },
        _sum: { paidAmount: true },
      }),
      prisma.notice.findMany({
        where: { schoolId },
        orderBy: { publishDate: "desc" },
        take: 5,
      }),
      prisma.studentEnrollment.findMany({
        where: { class: { schoolId } },
        orderBy: { enrolledAt: "desc" },
        take: 5,
        include: {
          student: { include: { profile: true } },
          class: true,
          section: true,
        },
      }),
    ]);

    const totalBilled = feeSum._sum.amount || 0;
    const totalCollected = paidFeeSum._sum.paidAmount || 0;
    const pendingDues = totalBilled - totalCollected;

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          studentsCount,
          teachersCount,
          classesCount,
          totalBilled,
          totalCollected,
          pendingDues,
        },
        recentNotices,
        recentStudents,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
