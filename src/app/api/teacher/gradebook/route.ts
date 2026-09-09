import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { calculateGrade } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "TEACHER" && user.role !== "SCHOOL_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");
    const subjectId = searchParams.get("subjectId");
    const classId = searchParams.get("classId");

    const schoolId = user.schoolId || (await prisma.school.findFirst())?.id;

    // Return exams and classes list if no specific exam selected
    const [exams, classes, subjects] = await Promise.all([
      prisma.exam.findMany({
        where: { term: { academicYear: { schoolId } } },
        include: { term: true, examSubjects: { include: { subject: true } } },
      }),
      prisma.class.findMany({
        where: { schoolId },
        include: { sections: true },
      }),
      prisma.subject.findMany({
        where: { schoolId },
      }),
    ]);

    if (!examId || !subjectId || !classId) {
      return NextResponse.json({
        success: true,
        data: { exams, classes, subjects, gradebook: null },
      });
    }

    // Find the examSubject
    const examSubject = await prisma.examSubject.findUnique({
      where: {
        examId_subjectId: { examId, subjectId },
      },
    });

    if (!examSubject) {
      return NextResponse.json({
        success: true,
        data: { exams, classes, subjects, gradebook: [] },
      });
    }

    // Get all enrolled students in this class
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { classId, status: "ENROLLED" },
      include: {
        student: { include: { profile: true } },
        section: true,
      },
      orderBy: { rollNumber: "asc" },
    });

    // Get existing scores
    const results = await prisma.examResult.findMany({
      where: { examSubjectId: examSubject.id },
    });

    const resultMap = new Map<string, (typeof results)[0]>();
    results.forEach((r) => resultMap.set(r.studentId, r));

    const gradebook = enrollments.map((e) => {
      const existing = resultMap.get(e.studentId);
      return {
        studentId: e.student.id,
        rollNumber: e.rollNumber,
        firstName: e.student.profile?.firstName || "Student",
        lastName: e.student.profile?.lastName || "",
        sectionName: e.section.name,
        marksObtained: existing?.marksObtained ?? "",
        grade: existing?.grade || "",
        remarks: existing?.remarks || "",
        maxMarks: examSubject.maxMarks,
        passMarks: examSubject.passMarks,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        exams,
        classes,
        subjects,
        examSubject,
        gradebook,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "TEACHER" && user.role !== "SCHOOL_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { examId, subjectId, scores } = body;

    if (!examId || !subjectId || !scores || !Array.isArray(scores)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    // Ensure ExamSubject exists
    let examSubject = await prisma.examSubject.findUnique({
      where: { examId_subjectId: { examId, subjectId } },
    });

    if (!examSubject) {
      examSubject = await prisma.examSubject.create({
        data: {
          examId,
          subjectId,
          maxMarks: 100,
          passMarks: 40,
        },
      });
    }

    for (const item of scores) {
      if (item.marksObtained === "" || item.marksObtained === null || item.marksObtained === undefined) continue;

      const marks = parseFloat(item.marksObtained);
      const grade = calculateGrade(marks, examSubject.maxMarks);

      await prisma.examResult.upsert({
        where: {
          examSubjectId_studentId: {
            examSubjectId: examSubject.id,
            studentId: item.studentId,
          },
        },
        create: {
          examSubjectId: examSubject.id,
          studentId: item.studentId,
          marksObtained: marks,
          grade: grade,
          remarks: item.remarks || null,
        },
        update: {
          marksObtained: marks,
          grade: grade,
          remarks: item.remarks || null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Grades successfully saved to database.",
    });
  } catch (error: any) {
    console.error("Gradebook save error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
