"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/common/StatsCard";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { CreditCard, DollarSign, CheckCircle2, Clock, Printer, Calendar, FileText, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PrintableFeeReceipt } from "@/components/reports/PrintableFeeReceipt";

export default function StudentFeesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  useEffect(() => {
    fetch("/api/student/fees")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const student = data?.student;
  const studentFullName = student?.profile
    ? `${student.profile.firstName} ${student.profile.lastName}`
    : "Student";
  const currentEnrollment = student?.enrollments?.[0];
  const className = currentEnrollment?.class?.name || "Class";
  const rollNumber = currentEnrollment?.rollNumber || "N/A";
  const schoolName = student?.school?.name || "Uprank Academy";

  return (
    <DashboardLayout allowedRoles={["STUDENT"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fee Ledger & Payment Receipts</h1>
          <p className="text-xs text-slate-500 mt-1">Review term invoices, paid balances, and downloadable verified digital receipts</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Fees"
            value={data ? formatCurrency(data.summary.totalFees ?? data.summary.totalAmount) : "..."}
            subtitle="Overall academic charges"
            icon={DollarSign}
            color="indigo"
          />
          <StatsCard
            title="Paid Fees"
            value={data ? formatCurrency(data.summary.paidFees ?? data.summary.totalPaid) : "..."}
            subtitle="Reconciled collections"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatsCard
            title="Pending / Due Fees"
            value={data ? formatCurrency(data.summary.dueFees ?? data.summary.totalPending) : "..."}
            subtitle="Outstanding balance"
            icon={CreditCard}
            color={(data?.summary?.dueFees ?? data?.summary?.totalPending) > 0 ? "rose" : "emerald"}
          />
          <StatsCard
            title="Fee Due Date"
            value={data?.summary?.feeDueDate ? formatDate(data.summary.feeDueDate) : "No Due Date"}
            subtitle={
              (data?.summary?.dueFees ?? data?.summary?.totalPending) > 0
                ? "Payment deadline"
                : "All dues cleared"
            }
            icon={Calendar}
            color="amber"
          />
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Invoices & Settlement History</h3>
            <span className="text-xs text-slate-500">{data?.invoices?.length || 0} Invoices</span>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <p className="text-xs text-slate-500">Loading fee records...</p>
            </div>
          ) : !data?.invoices || data.invoices.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Invoices Found"
              description="There are currently no fee invoices recorded for your account."
            />
          ) : (
            <div className="table-responsive-container">
              <table className="w-full text-left text-xs">
                <thead className="bg-white border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Invoice #</th>
                    <th className="p-4">Particulars</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-right">Paid</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.invoices?.map((inv: any) => {
                    const isPaid = inv.status === "PAID";
                    const lastPayment = inv.payments?.[0];

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-mono font-bold text-slate-800">{inv.invoiceNumber}</td>
                        <td className="p-4 font-semibold text-slate-900">{inv.title}</td>
                        <td className="p-4 text-right font-bold text-slate-900">{formatCurrency(inv.amount)}</td>
                        <td className="p-4 text-right font-bold text-emerald-600">{formatCurrency(inv.paidAmount)}</td>
                        <td className="p-4 text-slate-500">{formatDate(inv.dueDate)}</td>
                        <td className="p-4">
                          <Badge variant={isPaid ? "success" : "warning"}>
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          {isPaid && lastPayment ? (
                            <button
                              onClick={() =>
                                setSelectedReceipt({
                                  schoolName: schoolName,
                                  studentName: studentFullName,
                                  rollNumber: rollNumber,
                                  className: className,
                                  invoiceNumber: inv.invoiceNumber,
                                  receiptNumber: lastPayment.receiptNumber,
                                  transactionId: lastPayment.transactionId,
                                  paymentDate: lastPayment.paidAt,
                                  paymentMethod: lastPayment.paymentMethod,
                                  title: inv.title,
                                  amount: lastPayment.amount,
                                })
                              }
                              className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-100 font-semibold px-2.5 py-1 rounded text-[11px] transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Download Receipt</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 italic">Unsettled</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Printable Receipt Modal */}
        {selectedReceipt && (
          <PrintableFeeReceipt {...selectedReceipt} onClose={() => setSelectedReceipt(null)} />
        )}
      </div>
    </DashboardLayout>
  );
}
