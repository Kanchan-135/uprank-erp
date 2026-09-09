"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/common/StatsCard";
import { ClipboardCheck, Award, FileText, CalendarDays, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { formatTime, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function TeacherDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/overview")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout allowedRoles={["TEACHER"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty Instructional Portal</h1>
            <p className="text-xs text-slate-500 mt-1">Today's class periods, attendance tracking, and grading queue</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/teacher/attendance"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Mark Attendance Now</span>
            </Link>
          </div>
        </div>

        {/* Class Teacher Designation Banner */}
        {data?.primaryClass && data?.primarySection && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm shadow-amber-200">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Official Role Designation</span>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Class Teacher &bull; {data.primaryClass.name} ({data.primarySection.name})
                </h2>
              </div>
            </div>
            <Link
              href="/teacher/attendance"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-white/80 hover:bg-white px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
            >
              <span>Class Roll Call</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="My Assigned Classes"
            value={data?.assignedClasses?.length ?? "..."}
            subtitle="Active sections instructed"
            icon={Award}
            color="emerald"
          />
          <StatsCard
            title="Today's Periods"
            value={data?.todaySchedule?.length ?? "..."}
            subtitle="Scheduled classroom lectures"
            icon={Clock}
            color="blue"
          />
          <StatsCard
            title="Weekly Teaching Slots"
            value={data?.totalSlots ?? "..."}
            subtitle="Total periods across week"
            icon={CalendarDays}
            color="indigo"
          />
          <StatsCard
            title="Pending Submissions"
            value={data?.pendingGradingCount ?? "0"}
            subtitle="Student tasks awaiting score"
            icon={FileText}
            color="amber"
          />
        </div>

        {/* Schedule & Assigned Classes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Today's Classroom Schedule</h3>
                <p className="text-xs text-slate-500">Upcoming periods and lecture halls</p>
              </div>
              <Link
                href="/teacher/timetable"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {data?.todaySchedule?.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 italic">No teaching periods scheduled today.</div>
              ) : (
                data?.todaySchedule?.map((slot: any) => (
                  <div key={slot.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{slot.subject?.name}</h4>
                        <p className="text-[11px] text-slate-500">
                          {slot.class?.name} - {slot.section?.name} &bull; Room: {slot.roomNumber || "Main Wing"}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions & Notices */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Action Box */}
            <div className="bg-gradient-to-tr from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-md shadow-emerald-200">
              <h3 className="text-base font-bold">Classroom Operations</h3>
              <p className="text-xs text-emerald-100 mt-1 mb-4">
                Record today's roll call or enter student examination scores in the digital gradebook.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <Link
                  href="/teacher/attendance"
                  className="inline-flex items-center justify-center gap-2 bg-white text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs hover:bg-emerald-50 transition-colors"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Mark Roll Call</span>
                </Link>
                <Link
                  href="/teacher/gradebook"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-800/80 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-800 transition-colors"
                >
                  <Award className="w-4 h-4" />
                  <span>Enter Scores</span>
                </Link>
              </div>
            </div>

            {/* School Circulars */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Faculty Circulars</h4>
              <div className="space-y-3">
                {data?.recentNotices?.map((n: any) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <h5 className="text-xs font-bold text-slate-900">{n.title}</h5>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{n.content}</p>
                    <span className="text-[10px] text-slate-400 block mt-1.5">{formatDate(n.publishDate)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
