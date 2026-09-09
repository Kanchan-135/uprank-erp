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
    });

    if (!enrollment) {
      return NextResponse.json({ success: false, error: "Not enrolled" }, { status: 404 });
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        classId: enrollment.classId,
        sectionId: enrollment.sectionId,
      },
      include: {
        subject: true,
        teacher: { include: { profile: true } },
        submissions: {
          where: { studentId: user.id },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ success: true, data: assignments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { assignmentId, content } = body;

    if (!assignmentId || !content) {
      return NextResponse.json({ success: false, error: "Assignment ID and submission content are required" }, { status: 400 });
    }

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: user.id,
        },
      },
      create: {
        assignmentId,
        studentId: user.id,
        content,
        submittedAt: new Date(),
        status: "SUBMITTED",
      },
      update: {
        content,
        submittedAt: new Date(),
        status: "SUBMITTED",
      },
    });

    return NextResponse.json({ success: true, data: submission });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
