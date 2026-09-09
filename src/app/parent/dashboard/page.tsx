"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/common/StatsCard";
import { Users, ClipboardCheck, Award, CreditCard, UserCheck, Bell, ChevronDown, CheckCircle2, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function ParentDashboard() {
  const [data, setData] = useState<any>(null);
  const [activeChildId, setActiveChildId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadData = (childId?: string) => {
    setLoading(true);
    const query = childId ? `?childId=${childId}` : "";
    fetch(`/api/parent/overview${query}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
          if (json.data.activeChild) {
            setActiveChildId(json.data.activeChild.id);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChildSelect = (id: string) => {
    setActiveChildId(id);
    loadData(id);
  };

  const activeChild = data?.activeChild;

  return (
    <DashboardLayout allowedRoles={["PARENT"]}>
      <div className="space-y-6">
        {/* Child Selector Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 font-bold flex items-center justify-center text-lg border border-rose-100">
              {activeChild?.name?.[0] || "C"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{activeChild?.name || "Student"}</h2>
                <span className="text-[11px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                  {activeChild?.relationship || "Child"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeChild?.className} - {activeChild?.sectionName} &bull; Roll No: {activeChild?.rollNumber}
              </p>
            </div>
          </div>

          {/* Switch Child Dropdown if multiple children */}
          {data?.children?.length > 1 && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">Switch Ward:</span>
              <select
                value={activeChildId}
                onChange={(e) => handleChildSelect(e.target.value)}
                className="bg-white px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
              >
                {data.children.map((child: any) => (
                  <option key={child.id} value={child.id}>
                    {child.name} ({child.className})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Ward Attendance"
            value={data?.metrics ? `${data.metrics.attendancePercentage}%` : "..."}
            subtitle={`${data?.metrics?.totalLoggedDays ?? 0} total recorded days`}
            icon={ClipboardCheck}
            color="emerald"
          />
          <StatsCard
            title="Outstanding Dues"
            value={data?.metrics ? formatCurrency(data.metrics.pendingDues) : "..."}
            subtitle={`${data?.metrics?.unpaidInvoicesCount ?? 0} pending invoice(s)`}
            icon={CreditCard}
            color={(data?.metrics?.pendingDues ?? 0) > 0 ? "rose" : "emerald"}
          />
          <StatsCard
            title="Leave Requests"
            value={data?.metrics?.activeLeavesCount ?? "0"}
            subtitle="Pending approval"
            icon={UserCheck}
            color="blue"
          />
          <StatsCard
            title="Recent Exam Grade"
            value={data?.examResults?.[0]?.grade || "A+"}
            subtitle={data?.examResults?.[0]?.examSubject?.exam?.name || "Mid-Term Exam"}
            icon={Award}
            color="purple"
          />
        </div>

        {/* 2-Column: Quick Fee Settlement & Recent Attendance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Fee Invoices & Quick Pay */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Academic Fee Dues</h3>
                <p className="text-xs text-slate-500">Invoices for {activeChild?.name}</p>
              </div>
              <Link href="/parent/fees" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <span>All Invoices</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {data?.invoices?.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 italic">No fee invoices recorded.</div>
              ) : (
                data?.invoices?.map((inv: any) => {
                  const isPaid = inv.status === "PAID";

                  return (
                    <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{inv.title}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isPaid ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Invoice: {inv.invoiceNumber} &bull; Due: {formatDate(inv.dueDate)}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 block">{formatCurrency(inv.amount)}</span>
                        {isPaid ? (
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Settled
                          </span>
                        ) : (
                          <Link
                            href="/parent/fees"
                            className="inline-block mt-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1 rounded-lg"
                          >
                            Pay Online
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* School Circulars */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
              <Bell className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Parent Circulars</h4>
            </div>

            <div className="space-y-3">
              {data?.notices?.map((n: any) => (
                <div key={n.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="text-xs font-bold text-slate-900">{n.title}</h5>
                    {n.isUrgent && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{n.content}</p>
                  <span className="text-[10px] text-slate-400 block mt-1.5">{formatDate(n.publishDate)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
