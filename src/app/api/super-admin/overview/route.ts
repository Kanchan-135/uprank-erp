import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const [schoolsCount, studentsCount, teachersCount, totalFeesCollected, schools] = await Promise.all([
      prisma.school.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.feePayment.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS" },
      }),
      prisma.school.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { users: true, classes: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalSchools: schoolsCount,
          totalStudents: studentsCount,
          totalTeachers: teachersCount,
          totalRevenue: totalFeesCollected._sum.amount || 0,
        },
        schools,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
