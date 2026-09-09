"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClipboardCheck, Check, X, AlertCircle, Loader2, Save, Calendar, CheckCircle2 } from "lucide-react";

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const [roster, setRoster] = useState<any[]>([]);
  const [isMarked, setIsMarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load Classes
  useEffect(() => {
    fetch("/api/admin/academics")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.classes?.length > 0) {
          setClasses(json.data.classes);
          setSelectedClass(json.data.classes[0].id);
          if (json.data.classes[0].sections?.length > 0) {
            setSelectedSection(json.data.classes[0].sections[0].id);
          }
        }
      });
  }, []);

  // Load Attendance Roster
  const loadRoster = () => {
    if (!selectedClass || !selectedSection) return;
    setLoading(true);
    setSaveSuccess(false);

    fetch(`/api/teacher/attendance?classId=${selectedClass}&sectionId=${selectedSection}&date=${selectedDate}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setRoster(json.data.roster);
          setIsMarked(json.data.isMarked);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRoster();
  }, [selectedClass, selectedSection, selectedDate]);

  const handleStatusChange = (studentId: string, status: string) => {
    setRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, status } : item))
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, remarks } : item))
    );
  };

  const markAll = (status: string) => {
    setRoster((prev) => prev.map((item) => ({ ...item, status })));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          sectionId: selectedSection,
          date: selectedDate,
          records: roster,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setIsMarked(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert(data.error || "Failed to save attendance");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  const activeSections = classes.find((c) => c.id === selectedClass)?.sections || [];

  return (
    <DashboardLayout allowedRoles={["TEACHER", "SCHOOL_ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daily Student Roll Call & Attendance</h1>
            <p className="text-xs text-slate-500 mt-1">Record and update real-time attendance for designated class sections</p>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Attendance Saved!</span>
              </span>
            )}

            <button
              onClick={handleSaveAttendance}
              disabled={saving || roster.length === 0}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Roll Call</span>
            </button>
          </div>
        </div>

        {/* Filter / Selector Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Class Grade
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                const c = classes.find((cl) => cl.id === e.target.value);
                if (c?.sections?.length) setSelectedSection(c.sections[0].id);
              }}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              {activeSections.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            />
          </div>

          <div className="pt-4 sm:pt-0 flex items-center gap-2 justify-end">
            <button
              onClick={() => markAll("PRESENT")}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
            >
              All Present
            </button>
            <button
              onClick={() => markAll("ABSENT")}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
            >
              All Absent
            </button>
          </div>
        </div>

        {/* Student Roll Call Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Roster for {selectedDate}</span>
              {isMarked && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Recorded in Database
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500">{roster.length} Enrolled Students</span>
          </div>

          <div className="table-responsive-container">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Roll No</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5 text-center">Status (Select)</th>
                  <th className="p-3.5">Remarks / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roster.map((student) => (
                  <tr key={student.studentId} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-mono font-bold text-slate-800">{student.rollNumber}</td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                        {[
                          { val: "PRESENT", label: "Present", color: "peer-checked:bg-emerald-600 peer-checked:text-white" },
                          { val: "LATE", label: "Late", color: "peer-checked:bg-amber-500 peer-checked:text-white" },
                          { val: "ABSENT", label: "Absent", color: "peer-checked:bg-rose-600 peer-checked:text-white" },
                          { val: "EXCUSED", label: "Excused", color: "peer-checked:bg-blue-600 peer-checked:text-white" },
                        ].map((opt) => (
                          <label key={opt.val} className="cursor-pointer">
                            <input
                              type="radio"
                              name={`attendance-${student.studentId}`}
                              value={opt.val}
                              checked={student.status === opt.val}
                              onChange={() => handleStatusChange(student.studentId, opt.val)}
                              className="sr-only peer"
                            />
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors text-slate-600 hover:text-slate-900 ${opt.color}`}
                            >
                              {opt.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <input
                        type="text"
                        placeholder="Optional remarks (e.g. sick leave)..."
                        value={student.remarks || ""}
                        onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                        className="w-full max-w-xs px-2.5 py-1 border border-slate-200 rounded-lg text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
