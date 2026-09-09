"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Award, Save, CheckCircle2, Loader2, BookOpen } from "lucide-react";
import { calculateGrade } from "@/lib/utils";

export default function TeacherGradebookPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [gradebook, setGradebook] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initial Load
  useEffect(() => {
    fetch("/api/teacher/gradebook")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setExams(json.data.exams || []);
          setClasses(json.data.classes || []);
          setSubjects(json.data.subjects || []);

          if (json.data.exams?.length > 0) setSelectedExam(json.data.exams[0].id);
          if (json.data.classes?.length > 0) setSelectedClass(json.data.classes[0].id);
          if (json.data.subjects?.length > 0) setSelectedSubject(json.data.subjects[0].id);
        }
      });
  }, []);

  // Load scores for selection
  const loadScores = () => {
    if (!selectedExam || !selectedClass || !selectedSubject) return;
    setLoading(true);
    setSaveSuccess(false);

    fetch(`/api/teacher/gradebook?examId=${selectedExam}&classId=${selectedClass}&subjectId=${selectedSubject}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.gradebook) {
          setGradebook(json.data.gradebook);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadScores();
  }, [selectedExam, selectedClass, selectedSubject]);

  const handleScoreChange = (studentId: string, marks: string) => {
    setGradebook((prev) =>
      prev.map((item) => {
        if (item.studentId === studentId) {
          const numMarks = marks === "" ? "" : parseFloat(marks);
          const computedGrade = marks === "" ? "" : calculateGrade(typeof numMarks === "number" ? numMarks : 0, item.maxMarks);
          return {
            ...item,
            marksObtained: marks,
            grade: computedGrade,
          };
        }
        return item;
      })
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setGradebook((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, remarks } : item))
    );
  };

  const handleSaveGrades = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/teacher/gradebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExam,
          subjectId: selectedSubject,
          scores: gradebook,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert(json.error || "Failed to save grades");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["TEACHER", "SCHOOL_ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Digital Gradebook & Assessment</h1>
            <p className="text-xs text-slate-500 mt-1">Record term scores, automated letter grade computation, and student remarks</p>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Grades Saved!</span>
              </span>
            )}

            <button
              onClick={handleSaveGrades}
              disabled={saving || gradebook.length === 0}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Gradebook</span>
            </button>
          </div>
        </div>

        {/* Filter / Selector Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Examination
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.term?.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Class Grade
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
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
              Subject / Course
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scores Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Student Scores Ledger</span>
            <span className="text-xs text-slate-500">Max Marks: 100 &bull; Passing Marks: 40</span>
          </div>

          <div className="table-responsive-container">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Roll No</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Section</th>
                  <th className="p-3.5 text-center">Marks Obtained (/100)</th>
                  <th className="p-3.5 text-center">Grade</th>
                  <th className="p-3.5">Instructor Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gradebook.map((st) => (
                  <tr key={st.studentId} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-mono font-bold text-slate-800">{st.rollNumber}</td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {st.firstName} {st.lastName}
                    </td>
                    <td className="p-3.5 text-slate-600">{st.sectionName}</td>
                    <td className="p-3.5 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={st.marksObtained}
                        onChange={(e) => handleScoreChange(st.studentId, e.target.value)}
                        placeholder="0-100"
                        className="w-20 px-2.5 py-1 text-center font-bold text-slate-900 border border-slate-300 rounded-lg text-xs"
                      />
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-xs ${
                          st.grade === "A+" || st.grade === "A"
                            ? "bg-emerald-100 text-emerald-800"
                            : st.grade === "B+" || st.grade === "B"
                            ? "bg-blue-100 text-blue-800"
                            : st.grade === "C" || st.grade === "D"
                            ? "bg-amber-100 text-amber-800"
                            : st.grade === "F"
                            ? "bg-rose-100 text-rose-800"
                            : "text-slate-400"
                        }`}
                      >
                        {st.grade || "-"}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <input
                        type="text"
                        placeholder="Feedback / qualitative notes..."
                        value={st.remarks || ""}
                        onChange={(e) => handleRemarksChange(st.studentId, e.target.value)}
                        className="w-full max-w-sm px-2.5 py-1 border border-slate-200 rounded-lg text-xs"
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
