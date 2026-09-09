"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/common/StatsCard";
import {
  Sparkles,
  ShieldCheck,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Zap,
  Users,
  Building,
  HardDrive,
  Loader2,
  ChevronRight,
  Sliders,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminSubscriptionPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedCycle, setSelectedCycle] = useState("ANNUAL");

  const loadData = () => {
    fetch("/api/admin/subscription")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
          setSelectedPlan(json.data.school.plan);
          setSelectedCycle(json.data.school.billingCycle);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRenew = async () => {
    if (!confirm("Confirm subscription renewal for your institution?")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RENEW" }),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        loadData();
      } else {
        alert(json.error || "Renewal failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAutoRenew = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_AUTORENEW" }),
      });
      const json = await res.json();
      if (json.success) {
        loadData();
      } else {
        alert(json.error || "Failed to update preference");
      }
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePlan = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_SETTINGS",
          plan: selectedPlan,
          billingCycle: selectedCycle,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPlanModalOpen(false);
        alert("Subscription tier successfully upgraded!");
        loadData();
      } else {
        alert(json.error || "Plan update failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  const school = data?.school;
  const usage = data?.usage;

  return (
    <DashboardLayout allowedRoles={["SCHOOL_ADMIN", "SUPER_ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Subscription & License Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage institution license tier, validity periods, renewal preferences, and system quotas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPlanModalOpen(true)}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg border border-slate-200 transition-colors shadow-xs"
            >
              <Sliders className="w-4 h-4 text-slate-500" />
              <span>Change Plan / Cycle</span>
            </button>
            <button
              onClick={handleRenew}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>Renew Subscription</span>
            </button>
          </div>
        </div>

        {/* Hero Plan Overview Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500/30 text-indigo-200 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-400/30">
                  {school?.plan || "PROFESSIONAL"} TIER
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                    school?.status === "ACTIVE"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                      : "bg-rose-500/20 text-rose-300 border-rose-400/30"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      school?.status === "ACTIVE" ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                    }`}
                  />
                  {school?.status || "ACTIVE"}
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{school?.name || "Institution Campus"}</h2>
              <p className="text-xs text-indigo-200 max-w-xl">
                Operating under institutional cloud tenancy with automated daily backups, offline PWA access,
                and continuous regulatory compliance updates.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 min-w-[240px] text-center">
              <div className="text-[11px] uppercase tracking-wider text-indigo-200 font-semibold">
                Days Remaining in Term
              </div>
              <div className="text-4xl font-black mt-1 text-white">{school?.daysRemaining ?? "..."}</div>
              <div className="text-[11px] text-indigo-300 mt-1">
                Expires on {school?.expiryDate ? formatDate(school.expiryDate) : "..."}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Subscription Plan"
            value={school?.plan || "PROFESSIONAL"}
            subtitle="Current institutional tier"
            icon={Sparkles}
            color="indigo"
          />
          <StatsCard
            title="License Expiry Date"
            value={school?.expiryDate ? formatDate(school.expiryDate) : "..."}
            subtitle={`Started: ${school?.startDate ? formatDate(school.startDate) : "N/A"}`}
            icon={Calendar}
            color="amber"
          />
          <StatsCard
            title="Renewal Pricing"
            value={school ? formatCurrency(school.renewalPrice) : "..."}
            subtitle={`Billed on ${school?.billingCycle?.toLowerCase() || "annual"} cycle`}
            icon={CreditCard}
            color="emerald"
          />
          <StatsCard
            title="Auto-Renewal"
            value={school?.autoRenew ? "Enabled" : "Disabled"}
            subtitle={school?.autoRenew ? "Renews automatically on expiry" : "Requires manual approval"}
            icon={ShieldCheck}
            color={school?.autoRenew ? "emerald" : "rose"}
          />
        </div>

        {/* Quota & Utilization Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Institutional Quota & Resource Usage
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Enrolled Students</span>
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2">{usage?.studentsCount || 0}</div>
                <div className="text-[11px] text-slate-400 mt-1">Quota: 1,500 active accounts</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, ((usage?.studentsCount || 1) / 1500) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Faculty Members</span>
                  <Building className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2">{usage?.facultyCount || 0}</div>
                <div className="text-[11px] text-slate-400 mt-1">Quota: 100 educators</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, ((usage?.facultyCount || 1) / 100) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Cloud Storage</span>
                  <HardDrive className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2">1.4 GB</div>
                <div className="text-[11px] text-slate-400 mt-1">Quota: 10.0 GB NVMe</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "14%" }} />
                </div>
              </div>
            </div>

            {/* Plan Feature Verification Checklist */}
            <div className="border-t border-slate-100 pt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Active Tier Inclusions & Entitlements
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  "Class Teacher & Section Division Assignment",
                  "Editable Timetable Schedule Engine",
                  "Integrated Examination Management Hub",
                  "Automated Fee Ledger & Online Invoicing",
                  "Progressive Web App (PWA) Offline Access",
                  "Parent & Student Portal Access Across All Devices",
                  "Verified Digital PDF Fee Receipts",
                  "End-to-End Role Based Access Control (RBAC)",
                ].map((perk, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Renewal Settings & Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Renewal Configuration
              </h3>

              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <div className="text-xs font-semibold text-indigo-900">Next Scheduled Billing</div>
                <div className="text-xl font-bold text-indigo-950 mt-1">
                  {school ? formatCurrency(school.renewalPrice) : "..."}
                </div>
                <div className="text-[11px] text-indigo-700 mt-0.5">
                  Due upon {school?.expiryDate ? formatDate(school.expiryDate) : "term completion"}
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-800">Auto-Renew Subscription</div>
                  <div className="text-[11px] text-slate-500">Prevent service disruption on term end</div>
                </div>
                <button
                  onClick={handleToggleAutoRenew}
                  disabled={actionLoading}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    school?.autoRenew ? "bg-indigo-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      school?.autoRenew ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-500 pt-2">
                <div className="flex justify-between">
                  <span>Billing Frequency:</span>
                  <span className="font-bold text-slate-800">{school?.billingCycle || "ANNUAL"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Gateway:</span>
                  <span className="font-bold text-slate-800">Direct Institutional Invoice</span>
                </div>
                <div className="flex justify-between">
                  <span>License Term:</span>
                  <span className="font-bold text-slate-800">12 Months Dedicated</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={handleRenew}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-xs"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>Extend License (1 Year)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Change Plan Modal */}
        {planModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Change Subscription Plan & Billing</h3>
                <button onClick={() => setPlanModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  &times;
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Select Tier Plan</label>
                  <div className="grid grid-cols-3 gap-3">
                    {data?.plans?.map((p: any) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlan(p.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedPlan === p.id
                            ? "border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="font-bold">{p.name}</div>
                        <div className="text-slate-500 mt-1 font-normal">
                          {formatCurrency(selectedCycle === "MONTHLY" ? p.priceMonthly : p.priceAnnual)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Billing Cycle</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedCycle("ANNUAL")}
                      className={`p-2.5 rounded-lg border text-xs font-semibold ${
                        selectedCycle === "ANNUAL"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      Annual (Save ~16%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCycle("MONTHLY")}
                      className={`p-2.5 rounded-lg border text-xs font-semibold ${
                        selectedCycle === "MONTHLY"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      Monthly Flex
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdatePlan}
                  disabled={actionLoading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Save Plan Selection</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
