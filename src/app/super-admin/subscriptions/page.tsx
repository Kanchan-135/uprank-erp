"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/common/StatsCard";
import {
  Building2,
  Sparkles,
  CreditCard,
  AlertCircle,
  Search,
  Edit3,
  Calendar,
  CheckCircle2,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function SuperAdminSubscriptionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [plan, setPlan] = useState("PROFESSIONAL");
  const [status, setStatus] = useState("ACTIVE");
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [renewalPrice, setRenewalPrice] = useState("299");
  const [billingCycle, setBillingCycle] = useState("ANNUAL");
  const [autoRenew, setAutoRenew] = useState(true);

  const loadData = () => {
    fetch("/api/super-admin/subscriptions")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEditModal = (school: any) => {
    setEditingSchool(school);
    setPlan(school.plan);
    setStatus(school.status);
    setStartDate(school.startDate ? new Date(school.startDate).toISOString().split("T")[0] : "");
    setExpiryDate(school.expiryDate ? new Date(school.expiryDate).toISOString().split("T")[0] : "");
    setRenewalPrice(String(school.renewalPrice));
    setBillingCycle(school.billingCycle);
    setAutoRenew(school.autoRenew);
    setEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/super-admin/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: editingSchool.id,
          plan,
          status,
          startDate,
          expiryDate,
          renewalPrice,
          billingCycle,
          autoRenew,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEditModalOpen(false);
        loadData();
      } else {
        alert(json.error || "Failed to update subscription");
      }
    } catch {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const schools = data?.schools || [];
  const metrics = data?.metrics;

  const filteredSchools = schools.filter((s: any) => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout allowedRoles={["SUPER_ADMIN"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tenant Subscription & License Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global fleet oversight of institutional license tiers, renewal revenue, and tenancy lifecycles
          </p>
        </div>

        {/* Fleet Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Tenant Schools"
            value={metrics ? String(metrics.totalSchools) : "..."}
            subtitle="Registered institutional entities"
            icon={Building2}
            color="indigo"
          />
          <StatsCard
            title="Active Licenses"
            value={metrics ? String(metrics.totalActive) : "..."}
            subtitle="Operational school platforms"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatsCard
            title="Estimated Fleet ARR"
            value={metrics ? formatCurrency(metrics.totalArr) : "..."}
            subtitle="Annual recurring run-rate"
            icon={CreditCard}
            color="emerald"
          />
          <StatsCard
            title="Expiring Within 30 Days"
            value={metrics ? String(metrics.expiringSoon) : "..."}
            subtitle="Require renewal outreach"
            icon={AlertCircle}
            color={metrics?.expiringSoon > 0 ? "rose" : "indigo"}
          />
        </div>

        {/* Filter / Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search school name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Tenant Subscriptions Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Institutional Licenses</h3>
            <span className="text-xs text-slate-500">{filteredSchools.length} Institutions</span>
          </div>

          <div className="table-responsive-container">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Institution & Code</th>
                  <th className="p-4">License Plan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Start Date</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Days Left</th>
                  <th className="p-4 text-right">Renewal Terms</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchools.map((s: any) => {
                  const isActive = s.status === "ACTIVE";
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {s.code} &bull; {s.studentsCount} Students &bull; {s.facultyCount} Faculty
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px]">
                          {s.plan}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{formatDate(s.startDate)}</td>
                      <td className="p-4 font-semibold text-slate-900">{formatDate(s.expiryDate)}</td>
                      <td className="p-4">
                        <span
                          className={`font-mono font-bold ${
                            s.daysRemaining <= 30 ? "text-rose-600" : "text-slate-700"
                          }`}
                        >
                          {s.daysRemaining}d
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-bold text-slate-900">{formatCurrency(s.renewalPrice)}</div>
                        <div className="text-[10px] text-slate-400">
                          {s.billingCycle} &bull; {s.autoRenew ? "Auto" : "Manual"}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openEditModal(s)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit School Subscription Modal */}
        {editModalOpen && editingSchool && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Manage Tenant Subscription</h3>
                  <p className="text-xs text-slate-500">{editingSchool.name} ({editingSchool.code})</p>
                </div>
                <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Subscription Plan</label>
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="STARTER">STARTER</option>
                      <option value="PROFESSIONAL">PROFESSIONAL</option>
                      <option value="ENTERPRISE">ENTERPRISE</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="TRIAL">TRIAL</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                      <option value="EXPIRED">EXPIRED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Renewal Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={renewalPrice}
                      onChange={(e) => setRenewalPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Billing Cycle</label>
                    <select
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="ANNUAL">ANNUAL</option>
                      <option value="MONTHLY">MONTHLY</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="sa-autorenew"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label htmlFor="sa-autorenew" className="font-medium text-slate-700">
                    Enable Auto-Renewal flag for this institution
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Save Changes</span>
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
