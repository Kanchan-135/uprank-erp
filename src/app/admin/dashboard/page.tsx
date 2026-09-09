"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/common/StatsCard";
import { GraduationCap, Users, BookOpen, CreditCard, Bell, ArrowRight, UserPlus, FileCheck } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function SchoolAdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout allowedRoles={["SCHOOL_ADMIN", "SUPER_ADMIN"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institution Operational Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">Key institutional metrics, student admissions & financial overview</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/students"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Admit New Student</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Total Students"
            value={data?.metrics?.studentsCount ?? "..."}
            subtitle="Currently enrolled"
            icon={GraduationCap}
            color="blue"
          />
          <StatsCard
            title="Faculty & Teachers"
            value={data?.metrics?.teachersCount ?? "..."}
            subtitle="Active instructional staff"
            icon={Users}
            color="emerald"
          />
          <StatsCard
            title="Fee Collections"
            value={data ? formatCurrency(data.metrics.totalCollected) : "..."}
            subtitle="Revenue collected this term"
            icon={CreditCard}
            color="indigo"
          />
          <StatsCard
            title="Pending Dues"
            value={data ? formatCurrency(data.metrics.pendingDues) : "..."}
            subtitle="Unsettled student invoices"
            icon={CreditCard}
            color="rose"
          />
        </div>

        {/* 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Admissions */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Student Admissions</h3>
                <p className="text-xs text-slate-500">Newly enrolled students</p>
              </div>
              <Link href="/admin/students" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading admissions...</div>
              ) : !data?.recentStudents || data.recentStudents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 italic">No recent student admissions recorded.</div>
              ) : (
                data.recentStudents.map((item: any) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {item.student.profile?.firstName?.[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {item.student.profile?.firstName} {item.student.profile?.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.class.name} - {item.section.name} &bull; Roll: {item.rollNumber}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{formatDate(item.enrolledAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* School Circulars / Announcements */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Published Circulars</h3>
              </div>
              <Link href="/admin/notices" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading circulars...</div>
              ) : !data?.recentNotices || data.recentNotices.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 italic">No published circulars.</div>
              ) : (
                data.recentNotices.map((notice: any) => (
                  <div key={notice.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{notice.title}</h4>
                      {notice.isUrgent && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded shrink-0">
                          URGENT
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{notice.content}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 text-[10px] text-slate-400">
                      <span>Audience: {notice.targetRole}</span>
                      <span>{formatDate(notice.publishDate)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
