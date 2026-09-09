import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { invoiceId, paymentMethod = "ONLINE" } = body;

    if (!invoiceId) {
      return NextResponse.json({ success: false, error: "Invoice ID required" }, { status: 400 });
    }

    const invoice = await prisma.feeInvoice.findUnique({
      where: { id: invoiceId },
      include: { student: { include: { profile: true } } },
    });

    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    // Verify parent has relation to this student
    const relation = await prisma.parentStudent.findUnique({
      where: {
        parentId_studentId: {
          parentId: user.id,
          studentId: invoice.studentId,
        },
      },
    });

    if (!relation) {
      return NextResponse.json({ success: false, error: "Not authorized for this student" }, { status: 403 });
    }

    const remainingDue = invoice.amount - invoice.paidAmount;
    if (remainingDue <= 0) {
      return NextResponse.json({ success: false, error: "Invoice is already fully settled" }, { status: 400 });
    }

    const txnId = `TXN_ONL_${Date.now()}`;
    const receiptNum = `REC-${Date.now().toString().slice(-6)}`;

    // Create Payment Record
    const payment = await prisma.feePayment.create({
      data: {
        feeInvoiceId: invoice.id,
        amount: remainingDue,
        paymentMethod,
        transactionId: txnId,
        receiptNumber: receiptNum,
        status: "SUCCESS",
      },
    });

    // Update Invoice status to PAID
    await prisma.feeInvoice.update({
      where: { id: invoice.id },
      data: {
        paidAmount: invoice.amount,
        status: "PAID",
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        schoolId: invoice.schoolId,
        userId: user.id,
        action: "FEE_PAID_ONLINE",
        entityType: "FEE_INVOICE",
        entityId: invoice.id,
        details: `Parent ${user.email} settled invoice ${invoice.invoiceNumber} ($${remainingDue}) via ${paymentMethod}. Txn: ${txnId}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        payment,
        invoiceNumber: invoice.invoiceNumber,
        receiptNumber: receiptNum,
        amountPaid: remainingDue,
      },
      message: "Payment successfully processed!",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
