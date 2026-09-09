import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "TEACHER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { submissionId, score, feedback } = body;

    if (!submissionId || score === undefined || score === null) {
      return NextResponse.json({ success: false, error: "Submission ID and score are required" }, { status: 400 });
    }

    const submission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: parseFloat(score),
        feedback: feedback || null,
        status: "GRADED",
      },
    });

    return NextResponse.json({
      success: true,
      data: submission,
      message: "Submission evaluated successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
