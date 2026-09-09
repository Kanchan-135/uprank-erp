"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/common/StatsCard";
import { ClipboardCheck, Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ParentAttendancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/parent/overview")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeChild = data?.activeChild;
  const attendanceList = data?.recentAttendance || [];

  const total = attendanceList.length;
  const present = attendanceList.filter((a: any) => a.status === "PRESENT").length;
  const late = attendanceList.filter((a: any) => a.status === "LATE").length;
  const absent = attendanceList.filter((a: any) => a.status === "ABSENT").length;

  return (
    <DashboardLayout allowedRoles={["PARENT"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Attendance Monitor: {activeChild?.name || "Child"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time daily roll call records, absence remarks, and presence metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <StatsCard
            title="Attendance Rate"
            value={data ? `${data.metrics.attendancePercentage}%` : "..."}
            subtitle="Overall academic presence"
            icon={ClipboardCheck}
            color="emerald"
          />
          <StatsCard
            title="Sessions Present"
            value={present}
            subtitle="On-time attendance"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatsCard
            title="Late Arrivals"
            value={late}
            subtitle="Recorded late arrival"
            icon={Clock}
            color="amber"
          />
          <StatsCard
            title="Absences"
            value={absent}
            subtitle="Missed school days"
            icon={AlertCircle}
            color="rose"
          />
        </div>

        {/* Attendance Log Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Daily Attendance Record</h3>
            <span className="text-xs text-slate-500">{total} Logged School Days</span>
          </div>

          <div className="table-responsive-container">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Recorded Status</th>
                  <th className="p-4">Instructor Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceList.map((rec: any) => {
                  const statusColors: Record<string, string> = {
                    PRESENT: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    LATE: "bg-amber-50 text-amber-700 border-amber-200",
                    ABSENT: "bg-rose-50 text-rose-700 border-rose-200",
                    EXCUSED: "bg-blue-50 text-blue-700 border-blue-200",
                  };

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{formatDate(rec.date)}</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded border text-[11px] ${
                            statusColors[rec.status] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{rec.remarks || "Regular session"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
