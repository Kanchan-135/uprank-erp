import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const invoices = await prisma.feeInvoice.findMany({
      where: { studentId: user.id },
      include: {
        feeStructure: { include: { feeCategory: true } },
        payments: true,
        school: true,
      },
      orderBy: { dueDate: "desc" },
    });

    const totalAmount = invoices.reduce((s, i) => s + i.amount, 0);
    const totalPaid = invoices.reduce((s, i) => s + i.paidAmount, 0);
    const totalPending = Math.max(0, totalAmount - totalPaid);
    const pendingInvoices = invoices.filter((i) => i.status !== "PAID");
    const sortedPending = [...pendingInvoices].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const feeDueDate = sortedPending[0]?.dueDate || (invoices[0]?.dueDate ?? null);

    const student = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        school: true,
        enrollments: {
          include: { class: true, section: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        student,
        summary: {
          totalAmount,
          totalPaid,
          totalPending,
          totalFees: totalAmount,
          paidFees: totalPaid,
          dueFees: totalPending,
          feeDueDate,
        },
        invoices,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
