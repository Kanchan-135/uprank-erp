"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BookOpen, Plus, X, Loader2, Layers, BookMarked } from "lucide-react";

export default function AdminAcademicsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<"CLASS" | "SUBJECT" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Class form
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("");

  // Subject form
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectClassId, setSubjectClassId] = useState("");
  const [subjectType, setSubjectType] = useState("CORE");

  const loadAcademics = () => {
    fetch("/api/admin/academics")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAcademics();
  }, []);

  const handleCreateEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = { type: modalType };
      if (modalType === "CLASS") {
        payload.name = className;
        payload.code = classCode;
      } else {
        payload.name = subjectName;
        payload.code = subjectCode;
        payload.classId = subjectClassId || null;
        payload.subjectType = subjectType;
      }

      const res = await fetch("/api/admin/academics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setModalType(null);
        setClassName("");
        setClassCode("");
        setSubjectName("");
        setSubjectCode("");
        loadAcademics();
      } else {
        alert(json.error || "Failed to create");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["SCHOOL_ADMIN", "SUPER_ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Structure & Courses</h1>
            <p className="text-xs text-slate-500 mt-1">Configure classes, sections, academic calendars, and course catalog</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalType("CLASS")}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Class</span>
            </button>
            <button
              onClick={() => setModalType("SUBJECT")}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Course/Subject</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Classes & Sections */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Configured Classes & Sections</h3>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">
                {data?.classes?.length || 0} Classes
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {data?.classes?.map((c: any) => (
                <div key={c.id} className="p-4 hover:bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                      <span className="text-[11px] font-mono text-slate-400">Code: {c.code}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-500">Max Capacity: {c.capacity}</span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Sections:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {c.sections?.map((s: any) => (
                        <span
                          key={s.id}
                          className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200"
                        >
                          {s.name} ({s._count?.enrollments || 0} Enrolled)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects Directory */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Curriculum Subjects</h3>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                {data?.subjects?.length || 0} Courses
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {data?.subjects?.map((sub: any) => (
                <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{sub.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">Code: {sub.code}</p>
                    {sub.class && (
                      <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                        Assigned to: {sub.class.name}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                      sub.type === "CORE"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {sub.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal */}
        {modalType && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  {modalType === "CLASS" ? "Add New Class / Grade" : "Add New Academic Course"}
                </h3>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEntity} className="mt-4 space-y-4 text-xs">
                {modalType === "CLASS" ? (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Class Name *</label>
                      <input
                        type="text"
                        required
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        placeholder="e.g. Grade 11"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Class Code</label>
                      <input
                        type="text"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value)}
                        placeholder="e.g. G11"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Course / Subject Name *</label>
                      <input
                        type="text"
                        required
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                        placeholder="e.g. Chemistry & Molecular Studies"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Course Code *</label>
                      <input
                        type="text"
                        required
                        value={subjectCode}
                        onChange={(e) => setSubjectCode(e.target.value)}
                        placeholder="e.g. CHEM-10"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Course Type</label>
                      <select
                        value={subjectType}
                        onChange={(e) => setSubjectType(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      >
                        <option value="CORE">Core Mandatory</option>
                        <option value="ELECTIVE">Elective Course</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>Create Academic Entity</span>
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
