import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SCHOOL_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { classId, title, amount, dueDate, feeStructureId } = body;

    if (!classId || !title || !amount || !dueDate) {
      return NextResponse.json({ success: false, error: "Missing required invoicing fields" }, { status: 400 });
    }

    const schoolId = user.schoolId!;

    // Find active academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { schoolId, isCurrent: true },
    });

    if (!academicYear) {
      return NextResponse.json({ success: false, error: "No active academic year found" }, { status: 400 });
    }

    // Find all enrolled students in this class
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { classId, status: "ENROLLED" },
    });

    if (enrollments.length === 0) {
      return NextResponse.json({ success: false, error: "No students enrolled in this class" }, { status: 400 });
    }

    const createdInvoices = [];

    for (const enr of enrollments) {
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-${enr.rollNumber}`;

      const inv = await prisma.feeInvoice.create({
        data: {
          schoolId,
          studentId: enr.studentId,
          academicYearId: academicYear.id,
          feeStructureId: feeStructureId || null,
          invoiceNumber,
          title,
          amount: parseFloat(amount),
          paidAmount: 0,
          dueDate: new Date(dueDate),
          status: "PENDING",
        },
      });

      createdInvoices.push(inv);
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        schoolId,
        userId: user.id,
        action: "BULK_INVOICES_GENERATED",
        details: `Generated ${createdInvoices.length} invoices for Class ID: ${classId} (${title} - $${amount})`,
      },
    });

    return NextResponse.json({
      success: true,
      data: { count: createdInvoices.length },
      message: `Successfully generated ${createdInvoices.length} invoices.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
