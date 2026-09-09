import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { schoolId, status } = body;

    if (!schoolId || !status) {
      return NextResponse.json({ success: false, error: "School ID and status are required" }, { status: 400 });
    }

    const school = await prisma.school.update({
      where: { id: schoolId },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        schoolId: school.id,
        userId: user.id,
        action: "TENANT_STATUS_CHANGED",
        details: `School ${school.name} (${school.code}) status changed to ${status}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: school,
      message: `School status updated to ${status}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
