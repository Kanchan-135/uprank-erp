"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/common/StatsCard";
import { CreditCard, DollarSign, Search, Plus, CheckCircle2, AlertCircle, Printer, X, Loader2, Layers } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PrintableFeeReceipt } from "@/components/reports/PrintableFeeReceipt";

export default function AdminFeesPage() {
  const [data, setData] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [submitting, setSubmitting] = useState(false);

  // Bulk Invoicing Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkClassId, setBulkClassId] = useState("");
  const [bulkTitle, setBulkTitle] = useState("");
  const [bulkAmount, setBulkAmount] = useState("");
  const [bulkDueDate, setBulkDueDate] = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const loadFees = () => {
    fetch("/api/admin/fees")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));

    fetch("/api/admin/academics")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.classes?.length > 0) {
          setClasses(json.data.classes);
          setBulkClassId(json.data.classes[0].id);
        }
      });
  };

  useEffect(() => {
    loadFees();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECORD_PAYMENT",
          invoiceId: selectedInvoice.id,
          amount: paymentAmount,
          paymentMethod,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPaymentModalOpen(false);
        loadFees();
      } else {
        alert(json.error || "Failed to record payment");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkSubmitting(true);
    try {
      const res = await fetch("/api/admin/fees/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: bulkClassId,
          title: bulkTitle,
          amount: bulkAmount,
          dueDate: bulkDueDate,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setBulkModalOpen(false);
        setBulkTitle("");
        setBulkAmount("");
        alert(json.message || "Bulk invoices created");
        loadFees();
      } else {
        alert(json.error || "Bulk invoicing failed");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const filteredInvoices =
    data?.invoices?.filter((inv: any) => {
      const studentName = `${inv.student?.profile?.firstName} ${inv.student?.profile?.lastName}`.toLowerCase();
      return (
        studentName.includes(search.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())
      );
    }) || [];

  return (
    <DashboardLayout allowedRoles={["SCHOOL_ADMIN", "SUPER_ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Fee Management</h1>
            <p className="text-xs text-slate-500 mt-1">Fee collection logs, invoice tracking, offline reconciliation & printable receipts</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBulkModalOpen(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <Layers className="w-4 h-4" />
              <span>Bulk Bill Class</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Total Fees Billed"
            value={data?.summary ? formatCurrency(data.summary.totalBilled) : "..."}
            subtitle="Cumulative institutional billings"
            icon={DollarSign}
            color="indigo"
          />
          <StatsCard
            title="Total Fees Collected"
            value={data?.summary ? formatCurrency(data.summary.totalPaid) : "..."}
            subtitle="Verified realized payments"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatsCard
            title="Total Dues Pending"
            value={data?.summary ? formatCurrency(data.summary.totalPending) : "..."}
            subtitle="Unsettled student balances"
            icon={CreditCard}
            color={data?.summary?.totalPending > 0 ? "rose" : "emerald"}
          />
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or invoice #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Student Fee Invoices</h3>
            <span className="text-xs text-slate-500 font-medium">Showing {filteredInvoices.length} entries</span>
          </div>

          <div className="table-responsive-container">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Description Head</th>
                  <th className="p-4 text-right">Total Fees</th>
                  <th className="p-4 text-right">Paid Fees</th>
                  <th className="p-4 text-right">Due Fees</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv: any) => {
                  const isPaid = inv.status === "PAID";
                  const lastPayment = inv.payments?.[0];
                  const due = Math.max(0, inv.amount - inv.paidAmount);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-bold text-slate-800">{inv.invoiceNumber}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {inv.student?.profile?.firstName} {inv.student?.profile?.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400">{inv.student?.email}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-700">{inv.title}</td>
                      <td className="p-4 text-right font-bold text-slate-900">{formatCurrency(inv.amount)}</td>
                      <td className="p-4 text-right font-bold text-emerald-600">{formatCurrency(inv.paidAmount)}</td>
                      <td className="p-4 text-right font-bold text-rose-600">{formatCurrency(due)}</td>
                      <td className="p-4 text-slate-500">{formatDate(inv.dueDate)}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded text-[11px] border ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-emerald-500" : "bg-amber-500"}`} />
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {isPaid && lastPayment ? (
                          <button
                            onClick={() =>
                              setSelectedReceipt({
                                schoolName: "Greenwood International Academy",
                                studentName: `${inv.student?.profile?.firstName} ${inv.student?.profile?.lastName}`,
                                rollNumber: "101",
                                className: "Grade 10",
                                invoiceNumber: inv.invoiceNumber,
                                receiptNumber: lastPayment.receiptNumber,
                                transactionId: lastPayment.transactionId,
                                paymentDate: lastPayment.paidAt,
                                paymentMethod: lastPayment.paymentMethod,
                                title: inv.title,
                                amount: lastPayment.amount,
                              })
                            }
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-100 font-semibold px-2.5 py-1 rounded text-[11px]"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setPaymentAmount((inv.amount - inv.paidAmount).toString());
                              setPaymentModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded text-[11px]"
                          >
                            <span>Record Pay</span>
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

        {/* Bulk Invoicing Modal */}
        {bulkModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Bulk Generate Class Invoices</h3>
                <button onClick={() => setBulkModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBulkInvoice} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Class *</label>
                  <select
                    required
                    value={bulkClassId}
                    onChange={(e) => setBulkClassId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fee Description Head *</label>
                  <input
                    type="text"
                    required
                    value={bulkTitle}
                    onChange={(e) => setBulkTitle(e.target.value)}
                    placeholder="e.g. Term 3 Academic Tuition Fee"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Amount per Student ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={bulkAmount}
                      onChange={(e) => setBulkAmount(e.target.value)}
                      placeholder="1450.00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={bulkDueDate}
                      onChange={(e) => setBulkDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setBulkModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bulkSubmitting}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg"
                  >
                    {bulkSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                    <span>Generate Invoices</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Offline Payment Recording Modal */}
        {paymentModalOpen && selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Record Fee Collection</h3>
                <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Invoice Particulars:</span>
                  <p className="font-bold text-slate-900">{selectedInvoice.invoiceNumber} - {selectedInvoice.title}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Student: {selectedInvoice.student?.profile?.firstName} {selectedInvoice.student?.profile?.lastName}
                  </p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amount Collected ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="CASH">Cash Over Counter</option>
                    <option value="CHEQUE">Cheque / Demand Draft</option>
                    <option value="BANK_TRANSFER">Direct Wire Transfer</option>
                    <option value="ONLINE">POS Terminal Card</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                    <span>Confirm Receipt</span>
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
