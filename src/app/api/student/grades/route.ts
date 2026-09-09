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
      include: { class: true, section: true, academicYear: true },
    });

    const results = await prisma.examResult.findMany({
      where: { studentId: user.id },
      include: {
        examSubject: {
          include: {
            subject: true,
            exam: { include: { term: true } },
          },
        },
      },
      orderBy: { examSubject: { exam: { startDate: "desc" } } },
    });

    // Group by Exam
    const examsMap: Record<string, any> = {};
    results.forEach((r) => {
      const examName = r.examSubject.exam.name;
      if (!examsMap[examName]) {
        examsMap[examName] = {
          examName,
          term: r.examSubject.exam.term.name,
          subjects: [],
          totalObtained: 0,
          totalMax: 0,
        };
      }
      examsMap[examName].subjects.push({
        subjectName: r.examSubject.subject.name,
        subjectCode: r.examSubject.subject.code,
        marksObtained: r.marksObtained,
        maxMarks: r.examSubject.maxMarks,
        passMarks: r.examSubject.passMarks,
        grade: r.grade,
        remarks: r.remarks,
      });
      examsMap[examName].totalObtained += r.marksObtained;
      examsMap[examName].totalMax += r.examSubject.maxMarks;
    });

    const examsList = Object.values(examsMap).map((ex: any) => ({
      ...ex,
      percentage: ex.totalMax > 0 ? Math.round((ex.totalObtained / ex.totalMax) * 100) : 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        enrollment,
        exams: examsList,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
