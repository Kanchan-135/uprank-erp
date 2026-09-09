"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/common/StatsCard";
import {
  Award,
  Plus,
  Calendar,
  BookOpen,
  CheckCircle2,
  Clock,
  Settings,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [configureModalOpen, setConfigureModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);

  // Schedule Form
  const [examName, setExamName] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [examStatus, setExamStatus] = useState("PUBLISHED");
  const [submitting, setSubmitting] = useState(false);

  // Subject Config Form
  const [configSubjectId, setConfigSubjectId] = useState("");
  const [configMaxMarks, setConfigMaxMarks] = useState("100");
  const [configPassMarks, setConfigPassMarks] = useState("40");
  const [configExamDate, setConfigExamDate] = useState("");
  const [configSubmitting, setConfigSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/exams")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setExams(json.data.exams || []);
          setTerms(json.data.terms || []);
          setSubjects(json.data.subjects || []);
          if (json.data.terms?.length > 0 && !selectedTermId) {
            setSelectedTermId(json.data.terms[0].id);
          }
          if (json.data.subjects?.length > 0 && !configSubjectId) {
            setConfigSubjectId(json.data.subjects[0].id);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScheduleExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: examName,
          termId: selectedTermId,
          startDate,
          endDate,
          status: examStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setScheduleModalOpen(false);
        setExamName("");
        setStartDate("");
        setEndDate("");
        loadData();
      } else {
        alert(data.error || "Failed to schedule exam");
      }
    } catch {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSubjectToExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !configSubjectId) return;
    setConfigSubmitting(true);

    try {
      const res = await fetch("/api/admin/exams", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedExam.id,
          addSubject: {
            subjectId: configSubjectId,
            maxMarks: parseFloat(configMaxMarks),
            passMarks: parseFloat(configPassMarks),
            examDate: configExamDate || null,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh selected exam details
        setSelectedExam(data.data);
        loadData();
      } else {
        alert(data.error || "Failed to add subject");
      }
    } catch {
      alert("Network error");
    } finally {
      setConfigSubmitting(false);
    }
  };

  const handleToggleStatus = async (exam: any, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/exams", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: exam.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Are you sure you want to delete this examination and its records?")) return;
    try {
      const res = await fetch(`/api/admin/exams?id=${examId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) loadData();
      else alert(data.error || "Failed to delete exam");
    } catch {
      alert("Network error");
    }
  };

  const totalResultsCount = exams.reduce((total, ex) => {
    return (
      total +
      (ex.examSubjects?.reduce((subTotal: number, s: any) => subTotal + (s.results?.length || 0), 0) || 0)
    );
  }, 0);

  const publishedCount = exams.filter((e) => e.status === "PUBLISHED").length;

  return (
    <DashboardLayout allowedRoles={["SCHOOL_ADMIN", "SUPER_ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Examinations &amp; Academic Grading</h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure exam terms, assign test subjects with pass marks, and publish official report cards
            </p>
          </div>

          <button
            onClick={() => setScheduleModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Examination</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Total Examinations"
            value={exams.length}
            subtitle="Scheduled sessions across year"
            icon={Award}
            color="indigo"
          />
          <StatsCard
            title="Published Results"
            value={publishedCount}
            subtitle="Visible on student report cards"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatsCard
            title="Assigned Subjects"
            value={exams.reduce((sum, ex) => sum + (ex.examSubjects?.length || 0), 0)}
            subtitle="Courses configured for grading"
            icon={BookOpen}
            color="blue"
          />
          <StatsCard
            title="Recorded Scores"
            value={totalResultsCount}
            subtitle="Student exam marks entered"
            icon={FileCheck}
            color="amber"
          />
        </div>

        {/* Examinations List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Academic Examination Schedule</h2>
            <span className="text-xs text-slate-500">{exams.length} Total Sessions</span>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-xs">Loading examinations...</p>
              </div>
            ) : exams.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Award className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No examinations scheduled yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click "Schedule Examination" above to create your first exam term.
                </p>
              </div>
            ) : (
              exams.map((exam) => {
                const totalSubs = exam.examSubjects?.length || 0;
                const totalMarksRecorded =
                  exam.examSubjects?.reduce((sum: number, es: any) => sum + (es.results?.length || 0), 0) || 0;

                return (
                  <div key={exam.id} className="p-5 hover:bg-slate-50/70 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                            {exam.term?.name}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                              exam.status === "PUBLISHED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : exam.status === "ONGOING"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {exam.status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{exam.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {formatDate(exam.startDate)} &ndash; {formatDate(exam.endDate)}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status Toggle Button */}
                        <button
                          onClick={() =>
                            handleToggleStatus(
                              exam,
                              exam.status === "PUBLISHED" ? "COMPLETED" : "PUBLISHED"
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            exam.status === "PUBLISHED"
                              ? "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                              : "bg-emerald-600 text-white border-transparent hover:bg-emerald-700"
                          }`}
                        >
                          {exam.status === "PUBLISHED" ? "Unpublish Results" : "Publish Results"}
                        </button>

                        {/* Configure Subjects Button */}
                        <button
                          onClick={() => {
                            setSelectedExam(exam);
                            setConfigureModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Subjects ({totalSubs})</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Examination"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Subject Pills preview */}
                    {totalSubs > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-500 mr-1">
                          Evaluated Subjects:
                        </span>
                        {exam.examSubjects.map((es: any) => (
                          <span
                            key={es.id}
                            className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200 flex items-center gap-1"
                          >
                            <span>{es.subject?.name}</span>
                            <span className="text-slate-400 font-mono">({es.passMarks}/{es.maxMarks})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Schedule Examination Modal */}
        {scheduleModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">Schedule Examination</h3>
                </div>
                <button onClick={() => setScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleScheduleExam} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Examination Title *</label>
                  <input
                    type="text"
                    required
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g. Mid-Term Examination 2025"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Academic Term *</label>
                  <select
                    required
                    value={selectedTermId}
                    onChange={(e) => setSelectedTermId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    {terms.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.academicYear?.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Initial Status</label>
                  <select
                    value={examStatus}
                    onChange={(e) => setExamStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="UPCOMING">Upcoming (Planning Phase)</option>
                    <option value="ONGOING">Ongoing (Exam Underway)</option>
                    <option value="COMPLETED">Completed (Grading)</option>
                    <option value="PUBLISHED">Published (Visible to Students/Parents)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setScheduleModalOpen(false)}
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
                    <span>Schedule Exam</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Configure Subjects Modal */}
        {configureModalOpen && selectedExam && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Configure Examination Subjects</h3>
                  <p className="text-xs text-slate-500">{selectedExam.name}</p>
                </div>
                <button onClick={() => setConfigureModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Add Subject to Exam Form */}
              <form onSubmit={handleAddSubjectToExam} className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <span className="font-bold text-slate-900 block">Add or Configure Course for this Exam</span>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Select Subject *</label>
                  <select
                    required
                    value={configSubjectId}
                    onChange={(e) => setConfigSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.code}) &bull; {sub.class?.name || "All Classes"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Max Marks *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={configMaxMarks}
                      onChange={(e) => setConfigMaxMarks(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Pass Marks *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={configPassMarks}
                      onChange={(e) => setConfigPassMarks(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={configSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  {configSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Save Subject Configuration</span>
                </button>
              </form>

              {/* Existing Configured Subjects */}
              <div className="mt-5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Configured Subjects ({selectedExam.examSubjects?.length || 0})
                </h4>

                <div className="space-y-2">
                  {selectedExam.examSubjects?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No subjects configured yet.</p>
                  ) : (
                    selectedExam.examSubjects?.map((es: any) => (
                      <div
                        key={es.id}
                        className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{es.subject?.name}</p>
                          <p className="text-[11px] text-slate-500">
                            Passing: <span className="font-bold text-slate-800">{es.passMarks}</span> / Max:{" "}
                            <span className="font-bold text-slate-800">{es.maxMarks}</span>
                          </p>
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                          {es.results?.length || 0} Graded
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 mt-5">
                <button
                  onClick={() => setConfigureModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
