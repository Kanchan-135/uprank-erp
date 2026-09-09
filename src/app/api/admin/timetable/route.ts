import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const sectionId = searchParams.get("sectionId");

    const schoolId = user.schoolId || (await prisma.school.findFirst())?.id;
    if (!schoolId) {
      return NextResponse.json({ success: false, error: "No school found" }, { status: 400 });
    }

    const whereClause: any = {};
    if (classId) whereClause.classId = classId;
    if (sectionId) whereClause.sectionId = sectionId;

    const slots = await prisma.timetableSlot.findMany({
      where: whereClause,
      include: {
        class: true,
        section: true,
        subject: true,
        teacher: { include: { profile: true } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ success: true, data: slots });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SCHOOL_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { classId, sectionId, subjectId, teacherId, dayOfWeek, startTime, endTime, roomNumber } = body;

    if (!classId || !sectionId || !subjectId || !teacherId || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json({ success: false, error: "Missing required timetable slot parameters" }, { status: 400 });
    }

    const slot = await prisma.timetableSlot.create({
      data: {
        classId,
        sectionId,
        subjectId,
        teacherId,
        dayOfWeek,
        startTime,
        endTime,
        roomNumber,
      },
      include: {
        class: true,
        section: true,
        subject: true,
        teacher: { include: { profile: true } },
      },
    });

    return NextResponse.json({ success: true, data: slot }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SCHOOL_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { id, classId, sectionId, subjectId, teacherId, dayOfWeek, startTime, endTime, roomNumber } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Slot ID is required" }, { status: 400 });
    }

    const updated = await prisma.timetableSlot.update({
      where: { id },
      data: {
        ...(classId ? { classId } : {}),
        ...(sectionId ? { sectionId } : {}),
        ...(subjectId ? { subjectId } : {}),
        ...(teacherId ? { teacherId } : {}),
        ...(dayOfWeek ? { dayOfWeek } : {}),
        ...(startTime ? { startTime } : {}),
        ...(endTime ? { endTime } : {}),
        ...(roomNumber !== undefined ? { roomNumber } : {}),
      },
      include: {
        class: true,
        section: true,
        subject: true,
        teacher: { include: { profile: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated, message: "Timetable slot updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SCHOOL_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Slot ID is required" }, { status: 400 });
    }

    await prisma.timetableSlot.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Timetable slot removed successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
