"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/common/StatsCard";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Building2, Users, GraduationCap, DollarSign, ShieldAlert, ArrowUpRight, Plus, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function SuperAdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/super-admin/overview")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout allowedRoles={["SUPER_ADMIN"]}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Super Admin Platform Overview</h1>
            <p className="text-xs text-slate-500 mt-1">Multi-tenant institutional hierarchy, subscriptions & platform metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/super-admin/schools"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard New School</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Total Registered Schools"
            value={data?.metrics?.totalSchools ?? "..."}
            subtitle="Active academic tenants"
            icon={Building2}
            color="purple"
          />
          <StatsCard
            title="Total Students Enrolled"
            value={data?.metrics?.totalStudents ?? "..."}
            subtitle="Across all schools"
            icon={GraduationCap}
            color="blue"
          />
          <StatsCard
            title="Faculty & Teachers"
            value={data?.metrics?.totalTeachers ?? "..."}
            subtitle="Registered instructional staff"
            icon={Users}
            color="emerald"
          />
          <StatsCard
            title="Total Platform Revenue"
            value={data ? formatCurrency(data.metrics.totalRevenue) : "..."}
            subtitle="Fee payments reconciled"
            icon={DollarSign}
            color="amber"
          />
        </div>

        {/* Tenant Schools Directory */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Registered Institutional Tenants</h3>
              <p className="text-xs text-slate-500">Live multi-tenant instances on the platform</p>
            </div>
            <Link
              href="/super-admin/schools"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <p className="text-xs text-slate-500">Loading institutional tenants...</p>
            </div>
          ) : !data?.schools || data.schools.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No Schools Found"
              description="No schools have been onboarded to the platform yet."
              action={{
                label: "Onboard School",
                onClick: () => {
                  window.location.href = "/super-admin/schools";
                },
              }}
            />
          ) : (
            <div className="table-responsive-container">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">School Name</th>
                    <th className="p-4">Code / Slug</th>
                    <th className="p-4">Subscription Plan</th>
                    <th className="p-4">Total Users</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Onboarded Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.schools?.map((school: any) => (
                    <tr key={school.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {school.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div>{school.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{school.email || "No email"}</div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-600">{school.code}</td>
                      <td className="p-4">
                        <Badge variant="purple">
                          {school.subscriptionPlan}
                        </Badge>
                      </td>
                      <td className="p-4 text-slate-700 font-medium">{school._count?.users ?? 0} Users</td>
                      <td className="p-4">
                        <Badge variant="success" dot>
                          {school.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-slate-500">{formatDate(school.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
