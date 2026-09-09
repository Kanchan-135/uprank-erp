import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "TEACHER" && user.role !== "SCHOOL_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const assignments = await prisma.assignment.findMany({
      where: user.role === "TEACHER" ? { teacherId: user.id } : {},
      include: {
        class: true,
        section: true,
        subject: true,
        submissions: {
          include: {
            student: { include: { profile: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: assignments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "TEACHER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { classId, sectionId, subjectId, title, description, dueDate, maxScore } = body;

    if (!classId || !sectionId || !subjectId || !title || !dueDate) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        teacherId: user.id,
        classId,
        sectionId,
        subjectId,
        title,
        description: description || "",
        dueDate: new Date(dueDate),
        maxScore: maxScore ? parseFloat(maxScore) : 100,
      },
      include: {
        class: true,
        section: true,
        subject: true,
      },
    });

    return NextResponse.json({ success: true, data: assignment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
