"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserCheck, Plus, X, Loader2, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ParentLeavesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

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

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.activeChild) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/parent/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: data.activeChild.id,
          startDate,
          endDate,
          reason,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setModalOpen(false);
        setStartDate("");
        setEndDate("");
        setReason("");
        loadData();
      } else {
        alert(json.error || "Failed to submit leave application");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const activeChild = data?.activeChild;
  const leaves = data?.leaves || [];

  return (
    <DashboardLayout allowedRoles={["PARENT"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Student Leave Applications: {activeChild?.name || "Child"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">Submit absence requests directly to class faculty and monitor approval status</p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Student Leave</span>
          </button>
        </div>

        {/* Leaves Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Leave History</h3>
            <span className="text-xs text-slate-500">{leaves.length} Applications</span>
          </div>

          <div className="table-responsive-container">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Period Duration</th>
                  <th className="p-4">Reason Given</th>
                  <th className="p-4">Submitted Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Faculty Review Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                      No leave applications submitted yet.
                    </td>
                  </tr>
                ) : (
                  leaves.map((l: any) => {
                    const statusColors: Record<string, string> = {
                      APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      PENDING: "bg-amber-50 text-amber-700 border-amber-200",
                      REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
                    };

                    return (
                      <tr key={l.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-900">
                          {formatDate(l.startDate)} &rarr; {formatDate(l.endDate)}
                        </td>
                        <td className="p-4 text-slate-700 max-w-xs">{l.reason}</td>
                        <td className="p-4 text-slate-400">{formatDate(l.createdAt)}</td>
                        <td className="p-4">
                          <span
                            className={`font-bold px-2.5 py-0.5 rounded text-[11px] border ${
                              statusColors[l.status] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 italic">
                          {l.reviewNote || (l.status === "PENDING" ? "Awaiting class teacher review" : "No notes")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Student Absence Request</h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApplyLeave} className="mt-4 space-y-4 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Student:</span>
                  <p className="font-bold text-slate-900 text-sm">{activeChild?.name} ({activeChild?.className})</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Reason for Absence *</label>
                  <textarea
                    rows={4}
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Doctor's appointment / viral fever recovery..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                    <span>Submit Leave Request</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
