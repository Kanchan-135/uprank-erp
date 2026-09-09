import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const schoolId = user.schoolId || (await prisma.school.findFirst())?.id;

    const notices = await prisma.notice.findMany({
      where: {
        OR: [
          { schoolId: null },
          { schoolId: schoolId },
        ],
      },
      include: {
        author: {
          include: { profile: true },
        },
      },
      orderBy: { publishDate: "desc" },
    });

    return NextResponse.json({ success: true, data: notices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SCHOOL_ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, targetRole, isUrgent } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: "Title and content are required" }, { status: 400 });
    }

    const notice = await prisma.notice.create({
      data: {
        schoolId: user.schoolId,
        authorId: user.id,
        title,
        content,
        targetRole: targetRole || "ALL",
        isUrgent: !!isUrgent,
      },
    });

    return NextResponse.json({ success: true, data: notice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
