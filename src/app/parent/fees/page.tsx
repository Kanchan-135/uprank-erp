"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/common/StatsCard";
import { CreditCard, DollarSign, CheckCircle2, AlertCircle, Printer, X, Loader2, ShieldCheck, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PrintableFeeReceipt } from "@/components/reports/PrintableFeeReceipt";

export default function ParentFeesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Pay Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE_CARD");
  const [paying, setPaying] = useState(false);

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const loadData = () => {
    fetch("/api/parent/overview")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setPaying(true);

    try {
      const res = await fetch("/api/parent/fees/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          paymentMethod: "ONLINE_CARD",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setPayModalOpen(false);
        // Prompt receipt view
        setSelectedReceipt({
          schoolName: "Greenwood International Academy",
          studentName: data.activeChild?.name || "Student",
          rollNumber: data.activeChild?.rollNumber || "101",
          className: data.activeChild?.className || "Grade 10",
          invoiceNumber: selectedInvoice.invoiceNumber,
          receiptNumber: json.data.receiptNumber,
          transactionId: json.data.payment?.transactionId || "TXN_ONLINE",
          paymentDate: new Date(),
          paymentMethod: "Credit / Debit Card (Online)",
          title: selectedInvoice.title,
          amount: json.data.amountPaid,
        });
        loadData();
      } else {
        alert(json.error || "Payment failed");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setPaying(false);
    }
  };

  const activeChild = data?.activeChild;
  const invoices = data?.invoices || [];

  return (
    <DashboardLayout allowedRoles={["PARENT"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Fee Settlement & Online Payments: {activeChild?.name || "Child"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Securely pay academic tuition dues online and download verifiable fee receipts
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Fees"
            value={data ? formatCurrency(data.metrics?.totalFees ?? invoices.reduce((s: number, i: any) => s + i.amount, 0)) : "..."}
            subtitle="Academic term commitment"
            icon={DollarSign}
            color="indigo"
          />
          <StatsCard
            title="Paid Fees"
            value={data ? formatCurrency(data.metrics?.paidFees ?? invoices.reduce((s: number, i: any) => s + i.paidAmount, 0)) : "..."}
            subtitle="Processed and receipted"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatsCard
            title="Pending / Due Fees"
            value={data ? formatCurrency(data.metrics?.dueFees ?? data.metrics?.pendingDues ?? 0) : "..."}
            subtitle="Outstanding balance"
            icon={CreditCard}
            color={(data?.metrics?.dueFees ?? data?.metrics?.pendingDues) > 0 ? "rose" : "emerald"}
          />
          <StatsCard
            title="Fee Due Date"
            value={data?.metrics?.feeDueDate ? formatDate(data.metrics.feeDueDate) : "No Due Date"}
            subtitle={
              (data?.metrics?.dueFees ?? data?.metrics?.pendingDues) > 0
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Fee Invoices & Receipts</h3>
            <span className="text-xs text-slate-500">{invoices.length} Invoices</span>
          </div>

          <div className="table-responsive-container">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Invoice Number</th>
                  <th className="p-4">Fee Head Particulars</th>
                  <th className="p-4 text-right">Invoice Amount</th>
                  <th className="p-4 text-right">Paid Amount</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Payment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv: any) => {
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
                        <span
                          className={`font-bold px-2.5 py-0.5 rounded text-[11px] border ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {isPaid && lastPayment ? (
                          <button
                            onClick={() =>
                              setSelectedReceipt({
                                schoolName: "Greenwood International Academy",
                                studentName: activeChild?.name || "Student",
                                rollNumber: activeChild?.rollNumber || "101",
                                className: activeChild?.className || "Grade 10",
                                invoiceNumber: inv.invoiceNumber,
                                receiptNumber: lastPayment.receiptNumber,
                                transactionId: lastPayment.transactionId,
                                paymentDate: lastPayment.paidAt,
                                paymentMethod: lastPayment.paymentMethod,
                                title: inv.title,
                                amount: lastPayment.amount,
                              })
                            }
                            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-100 font-semibold px-3 py-1 rounded-lg text-[11px]"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Download Receipt</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setPayModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-xs"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Now (${inv.amount - inv.paidAmount})</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Online Payment Modal */}
        {payModalOpen && selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">Uprank Secure Payment Gateway</h3>
                </div>
                <button onClick={() => setPayModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePayNow} className="mt-4 space-y-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-slate-500 block mb-1">Invoice Particulars</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedInvoice.title}</p>
                  <p className="font-mono text-slate-500 mt-0.5">Invoice: {selectedInvoice.invoiceNumber}</p>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200 text-sm">
                    <span className="font-semibold text-slate-700">Amount Due:</span>
                    <span className="font-bold text-emerald-700 text-base">
                      {formatCurrency(selectedInvoice.amount - selectedInvoice.paidAmount)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">Payment Method</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="ONLINE_CARD"
                        checked={paymentMethod === "ONLINE_CARD"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-indigo-600"
                      />
                      <div>
                        <p className="font-bold text-slate-800">Credit / Debit Card</p>
                        <p className="text-[10px] text-slate-400">Visa, Mastercard, American Express</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="NET_BANKING"
                        checked={paymentMethod === "NET_BANKING"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-indigo-600"
                      />
                      <div>
                        <p className="font-bold text-slate-800">Instant Net Banking / ACH</p>
                        <p className="text-[10px] text-slate-400">Direct authorized bank transfer</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setPayModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paying}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg shadow-sm"
                  >
                    {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Authorize Payment</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Printable Receipt Modal */}
        {selectedReceipt && (
          <PrintableFeeReceipt {...selectedReceipt} onClose={() => setSelectedReceipt(null)} />
        )}
      </div>
    </DashboardLayout>
  );
}
