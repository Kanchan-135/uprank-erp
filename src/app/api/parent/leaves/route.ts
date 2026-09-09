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
    const studentId = searchParams.get("studentId");

    const leaves = await prisma.leaveRequest.findMany({
      where: {
        requesterId: user.id,
        ...(studentId ? { studentId } : {}),
      },
      include: {
        student: { include: { profile: true } },
        reviewedBy: { include: { profile: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: leaves });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, startDate, endDate, reason } = body;

    if (!studentId || !startDate || !endDate || !reason) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        requesterId: user.id,
        studentId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: "PENDING",
      },
      include: {
        student: { include: { profile: true } },
      },
    });

    return NextResponse.json({ success: true, data: leave }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
