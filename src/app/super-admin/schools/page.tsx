"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Building2, Search, X, Check, Loader2, Globe, Phone, Mail, Power, PowerOff } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function SuperAdminSchools() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [slug, setSlug] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState("PRO");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");

  const loadSchools = () => {
    fetch("/api/super-admin/schools")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setSchools(json.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSchools();
  }, []);

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/super-admin/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          code,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          address,
          phone,
          email,
          subscriptionPlan,
          adminEmail,
          adminFirstName,
          adminLastName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        // Reset form
        setName("");
        setCode("");
        setSlug("");
        setAddress("");
        setPhone("");
        setEmail("");
        setAdminEmail("");
        loadSchools();
      } else {
        alert(data.error || "Failed to create school");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (school: any) => {
    const newStatus = school.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setTogglingId(school.id);
    try {
      const res = await fetch("/api/super-admin/schools/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: school.id,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        loadSchools();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredSchools = schools.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.code.toLowerCase().includes(term) ||
      (s.email && s.email.toLowerCase().includes(term))
    );
  });

  return (
    <DashboardLayout allowedRoles={["SUPER_ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Tenants Directory</h1>
            <p className="text-xs text-slate-500 mt-1">Manage tenant schools, subscriptions, status, and administrative access</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Institution</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by school name, code or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Schools Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="table-responsive-container">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Institution Details</th>
                  <th className="p-4">Identifier Code</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Plan Tier</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchools.map((school) => {
                  const isActive = school.status === "ACTIVE";

                  return (
                    <tr key={school.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{school.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">slug: /{school.slug}</div>
                        {school.address && <div className="text-[11px] text-slate-500 mt-0.5">{school.address}</div>}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-700">{school.code}</td>
                      <td className="p-4 space-y-0.5">
                        {school.email && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{school.email}</span>
                          </div>
                        )}
                        {school.phone && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{school.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px]">
                          {school.subscriptionPlan}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {school.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{formatDate(school.createdAt)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(school)}
                          disabled={togglingId === school.id}
                          className={`text-[11px] font-bold px-3 py-1 rounded-lg border transition-colors ${
                            isActive
                              ? "text-rose-700 border-rose-200 hover:bg-rose-50"
                              : "text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          }`}
                        >
                          {togglingId === school.id ? "Updating..." : isActive ? "Suspend" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Onboard Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Onboard New Educational Institution</h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSchool} className="mt-4 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">Institution Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Oakridge Global School"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Institution Code *</label>
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="OGS-2025"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">URL Slug</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="oakridge-global"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono lowercase"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Official Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@oakridge.edu"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-1122"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">Campus Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Education Way, City, State"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-2">Initial School Administrator Account</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Admin First Name</label>
                      <input
                        type="text"
                        required
                        value={adminFirstName}
                        onChange={(e) => setAdminFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Admin Last Name</label>
                      <input
                        type="text"
                        required
                        value={adminLastName}
                        onChange={(e) => setAdminLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="font-semibold text-slate-700 block mb-1">Admin Email (Login ID) *</label>
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="principal@oakridge.edu"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
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
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg shadow-xs"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>Provision Institution</span>
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
