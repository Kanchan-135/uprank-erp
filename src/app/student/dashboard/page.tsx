"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/common/StatsCard";
import { ClipboardCheck, Award, FileText, CalendarDays, Clock, ArrowRight, DollarSign, Bell } from "lucide-react";
import { formatCurrency, formatTime, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function StudentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/overview")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout allowedRoles={["STUDENT"]}>
      <div className="space-y-6">
        {/* Student Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white rounded-2xl p-6 shadow-md shadow-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-block bg-white/20 text-white text-[11px] font-bold px-3 py-0.5 rounded-full mb-2">
              Academic Session {data?.student?.academicYear || "2024-2025"}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, {data?.student?.name || "Student"}!</h1>
            <p className="text-xs text-indigo-100 mt-1 font-medium">
              Class: {data?.student?.className} &bull; Section {data?.student?.sectionName} &bull; Roll Number:{" "}
              {data?.student?.rollNumber}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/student/grades"
              className="bg-white text-indigo-800 hover:bg-indigo-50 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              View Report Card
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Attendance Rate"
            value={data ? `${data.metrics.attendancePercentage}%` : "..."}
            subtitle={`${data?.metrics?.totalPresentDays ?? 0} days attended of ${data?.metrics?.totalLoggedDays ?? 0}`}
            icon={ClipboardCheck}
            color="emerald"
          />
          <StatsCard
            title="Today's Classes"
            value={data?.todaySchedule?.length ?? "..."}
            subtitle="Scheduled lectures today"
            icon={CalendarDays}
            color="blue"
          />
          <StatsCard
            title="Pending Assignments"
            value={data?.metrics?.pendingAssignmentsCount ?? "0"}
            subtitle="Coursework due soon"
            icon={FileText}
            color="amber"
          />
          <StatsCard
            title="Fee Dues"
            value={data ? formatCurrency(data.metrics.totalPendingDues) : "..."}
            subtitle="Pending balance"
            icon={DollarSign}
            color={data?.metrics?.totalPendingDues > 0 ? "rose" : "emerald"}
          />
        </div>

        {/* Schedule & Homework */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Today's Classes */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Today's Lectures & Timings</h3>
                <p className="text-xs text-slate-500">Class schedule for today</p>
              </div>
              <Link
                href="/student/timetable"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {data?.todaySchedule?.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 italic">No classes scheduled for today.</div>
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
                          Teacher: {slot.teacher?.profile?.firstName} {slot.teacher?.profile?.lastName} &bull; Room:{" "}
                          {slot.roomNumber || "Main Building"}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Tasks & Notices */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assignments Due</h4>
                <Link href="/student/assignments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                  View All
                </Link>
              </div>

              <div className="space-y-2.5">
                {data?.assignments?.map((a: any) => {
                  const isSubmitted = a.submissions?.length > 0;
                  return (
                    <div key={a.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">{a.subject?.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                            isSubmitted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isSubmitted ? "Submitted" : "Pending"}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900">{a.title}</h5>
                      <span className="text-[10px] text-slate-400 mt-1 block">Due: {formatDate(a.dueDate)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Campus Announcements</h4>
              </div>
              <div className="space-y-3">
                {data?.notices?.map((n: any) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <h5 className="text-xs font-bold text-slate-900">{n.title}</h5>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{n.content}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">{formatDate(n.publishDate)}</span>
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
