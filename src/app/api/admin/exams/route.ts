import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SCHOOL_ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const schoolId = user.schoolId || (await prisma.school.findFirst())?.id;
    if (!schoolId) {
      return NextResponse.json({ success: false, error: "No school found" }, { status: 400 });
    }

    const [exams, terms, subjects] = await Promise.all([
      prisma.exam.findMany({
        where: { term: { academicYear: { schoolId } } },
        include: {
          term: { include: { academicYear: true } },
          examSubjects: {
            include: {
              subject: true,
              results: { select: { id: true, marksObtained: true, grade: true } },
            },
          },
        },
        orderBy: { startDate: "desc" },
      }),
      prisma.term.findMany({
        where: { academicYear: { schoolId } },
        include: { academicYear: true },
        orderBy: { startDate: "asc" },
      }),
      prisma.subject.findMany({
        where: { schoolId },
        include: { class: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        exams,
        terms,
        subjects,
      },
    });
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
    const { termId, name, startDate, endDate, status, subjects } = body;

    if (!termId || !name || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: "Missing required examination fields" }, { status: 400 });
    }

    const exam = await prisma.exam.create({
      data: {
        termId,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || "PUBLISHED",
        ...(subjects && Array.isArray(subjects) && subjects.length > 0
          ? {
              examSubjects: {
                create: subjects.map((s: any) => ({
                  subjectId: s.subjectId,
                  maxMarks: parseFloat(s.maxMarks) || 100,
                  passMarks: parseFloat(s.passMarks) || 40,
                  examDate: s.examDate ? new Date(s.examDate) : null,
                })),
              },
            }
          : {}),
      },
      include: {
        term: true,
        examSubjects: { include: { subject: true } },
      },
    });

    return NextResponse.json({ success: true, data: exam, message: "Examination scheduled successfully" }, { status: 201 });
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
    const { id, name, startDate, endDate, status, termId, addSubject } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Exam ID is required" }, { status: 400 });
    }

    // If adding or updating a subject to this exam
    if (addSubject) {
      const { subjectId, maxMarks, passMarks, examDate } = addSubject;
      if (!subjectId) {
        return NextResponse.json({ success: false, error: "Subject ID required" }, { status: 400 });
      }

      await prisma.examSubject.upsert({
        where: {
          examId_subjectId: { examId: id, subjectId },
        },
        update: {
          maxMarks: parseFloat(maxMarks) || 100,
          passMarks: parseFloat(passMarks) || 40,
          examDate: examDate ? new Date(examDate) : null,
        },
        create: {
          examId: id,
          subjectId,
          maxMarks: parseFloat(maxMarks) || 100,
          passMarks: parseFloat(passMarks) || 40,
          examDate: examDate ? new Date(examDate) : null,
        },
      });
    }

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {}),
        ...(status ? { status } : {}),
        ...(termId ? { termId } : {}),
      },
      include: {
        term: true,
        examSubjects: { include: { subject: true, results: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated, message: "Exam updated successfully" });
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
      return NextResponse.json({ success: false, error: "Exam ID is required" }, { status: 400 });
    }

    await prisma.exam.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Exam deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
