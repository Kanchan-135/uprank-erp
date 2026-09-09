import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const records = await prisma.attendance.findMany({
      where: { studentId: user.id },
      orderBy: { date: "desc" },
    });

    const totalDays = records.length;
    const present = records.filter((r) => r.status === "PRESENT").length;
    const late = records.filter((r) => r.status === "LATE").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const excused = records.filter((r) => r.status === "EXCUSED").length;

    const rate = totalDays > 0 ? Math.round(((present + late) / totalDays) * 100) : 100;

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalDays,
          present,
          late,
          absent,
          excused,
          rate,
        },
        records,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
