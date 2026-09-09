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
    if (!schoolId) {
      return NextResponse.json({ success: false, error: "No school found" }, { status: 400 });
    }

    const [invoices, feeStructures, feeCategories] = await Promise.all([
      prisma.feeInvoice.findMany({
        where: { schoolId },
        include: {
          student: { include: { profile: true } },
          feeStructure: { include: { feeCategory: true } },
          payments: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.feeStructure.findMany({
        where: { schoolId },
        include: { class: true, feeCategory: true },
      }),
      prisma.feeCategory.findMany({
        where: { schoolId },
      }),
    ]);

    const totalBilled = invoices.reduce((s, i) => s + i.amount, 0);
    const totalPaid = invoices.reduce((s, i) => s + i.paidAmount, 0);
    const totalPending = Math.max(0, totalBilled - totalPaid);

    return NextResponse.json({
      success: true,
      data: {
        invoices,
        feeStructures,
        feeCategories,
        summary: {
          totalBilled,
          totalPaid,
          totalPending,
        },
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
    const { action } = body;

    if (action === "CREATE_CATEGORY") {
      const category = await prisma.feeCategory.create({
        data: {
          schoolId: user.schoolId!,
          name: body.name,
          description: body.description,
        },
      });
      return NextResponse.json({ success: true, data: category });
    }

    if (action === "CREATE_STRUCTURE") {
      const structure = await prisma.feeStructure.create({
        data: {
          schoolId: user.schoolId!,
          classId: body.classId,
          feeCategoryId: body.feeCategoryId,
          amount: parseFloat(body.amount),
          frequency: body.frequency || "QUARTERLY",
        },
      });
      return NextResponse.json({ success: true, data: structure });
    }

    if (action === "RECORD_PAYMENT") {
      const { invoiceId, amount, paymentMethod } = body;
      const invoice = await prisma.feeInvoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });

      const newPaidAmount = invoice.paidAmount + parseFloat(amount);
      const isPaid = newPaidAmount >= invoice.amount;

      const payment = await prisma.feePayment.create({
        data: {
          feeInvoiceId: invoice.id,
          amount: parseFloat(amount),
          paymentMethod: paymentMethod || "CASH",
          transactionId: `TXN_ADMIN_${Date.now()}`,
          receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
          status: "SUCCESS",
        },
      });

      await prisma.feeInvoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount,
          status: isPaid ? "PAID" : "PARTIAL",
        },
      });

      return NextResponse.json({ success: true, data: payment });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
