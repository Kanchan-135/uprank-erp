"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FileText, Plus, X, Loader2, Calendar, CheckCircle2, Award, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Assignment Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Submissions Evaluation Modal
  const [activeSubmissionsAssignment, setActiveSubmissionsAssignment] = useState<any>(null);
  const [evaluatingSubId, setEvaluatingSubId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState<{ [id: string]: string }>({});
  const [feedbackInput, setFeedbackInput] = useState<{ [id: string]: string }>({});
  const [evaluatingLoading, setEvaluatingLoading] = useState(false);

  // Form fields
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState("100");

  const loadAssignments = () => {
    fetch("/api/teacher/assignments")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setAssignments(json.data);
      })
      .finally(() => setLoading(false));

    fetch("/api/admin/academics")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setClasses(json.data.classes || []);
          setSubjects(json.data.subjects || []);
          if (json.data.classes?.length > 0) {
            setClassId(json.data.classes[0].id);
            if (json.data.classes[0].sections?.length > 0) {
              setSectionId(json.data.classes[0].sections[0].id);
            }
          }
          if (json.data.subjects?.length > 0) {
            setSubjectId(json.data.subjects[0].id);
          }
        }
      });
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          sectionId,
          subjectId,
          title,
          description,
          dueDate,
          maxScore,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setTitle("");
        setDescription("");
        loadAssignments();
      } else {
        alert(data.error || "Failed to create assignment");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeSubmission = async (subId: string) => {
    const score = gradeInput[subId];
    const feedback = feedbackInput[subId];
    if (score === undefined || score === "") {
      alert("Please enter a score");
      return;
    }

    setEvaluatingLoading(true);
    setEvaluatingSubId(subId);

    try {
      const res = await fetch("/api/teacher/assignments/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: subId,
          score,
          feedback,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setActiveSubmissionsAssignment((prev: any) => {
          if (!prev) return null;
          return {
            ...prev,
            submissions: prev.submissions.map((s: any) =>
              s.id === subId ? { ...s, score: parseFloat(score), feedback, status: "GRADED" } : s
            ),
          };
        });
        loadAssignments();
      } else {
        alert(data.error || "Failed to grade submission");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setEvaluatingLoading(false);
      setEvaluatingSubId(null);
    }
  };

  const activeSections = classes.find((c) => c.id === classId)?.sections || [];

  return (
    <DashboardLayout allowedRoles={["TEACHER", "SCHOOL_ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assignments & Homework Manager</h1>
            <p className="text-xs text-slate-500 mt-1">Publish coursework, specify submission deadlines, and evaluate student work</p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        </div>

        {/* Assignments List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {assignments.map((item) => {
            const subCount = item.submissions?.length || 0;

            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {item.subject?.name} &bull; {item.class?.name} - {item.section?.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-bold">Max: {item.maxScore} pts</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-4">{item.description}</p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due: {formatDate(item.dueDate)}</span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveSubmissionsAssignment(item);
                      // Pre-fill existing grades
                      const grades: { [id: string]: string } = {};
                      const feedbacks: { [id: string]: string } = {};
                      item.submissions?.forEach((s: any) => {
                        if (s.score !== null) grades[s.id] = s.score.toString();
                        if (s.feedback) feedbacks[s.id] = s.feedback;
                      });
                      setGradeInput(grades);
                      setFeedbackInput(feedbacks);
                    }}
                    className="inline-flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    <span>Evaluate Submissions ({subCount})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submissions Evaluation Modal */}
        {activeSubmissionsAssignment && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">
                    {activeSubmissionsAssignment.subject?.name}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{activeSubmissionsAssignment.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeSubmissionsAssignment.submissions?.length || 0} student(s) submitted work
                  </p>
                </div>
                <button
                  onClick={() => setActiveSubmissionsAssignment(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 my-4 max-h-96 overflow-y-auto pr-1">
                {activeSubmissionsAssignment.submissions?.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 italic">No submissions yet for this task.</div>
                ) : (
                  activeSubmissionsAssignment.submissions.map((sub: any) => (
                    <div key={sub.id} className="py-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="font-bold text-xs text-slate-900">
                            {sub.student?.profile?.firstName} {sub.student?.profile?.lastName}
                          </span>
                          <span className="text-[11px] text-slate-400">({sub.student?.email})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDate(sub.submittedAt)}</span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 italic">
                        "{sub.content || "No text provided"}"
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-600 shrink-0">Score:</span>
                          <input
                            type="number"
                            min="0"
                            max={activeSubmissionsAssignment.maxScore}
                            value={gradeInput[sub.id] || ""}
                            onChange={(e) =>
                              setGradeInput((prev) => ({ ...prev, [sub.id]: e.target.value }))
                            }
                            placeholder={`0-${activeSubmissionsAssignment.maxScore}`}
                            className="w-24 px-2 py-1 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                          />
                        </div>

                        <div className="flex-1 w-full flex items-center gap-2">
                          <input
                            type="text"
                            value={feedbackInput[sub.id] || ""}
                            onChange={(e) =>
                              setFeedbackInput((prev) => ({ ...prev, [sub.id]: e.target.value }))
                            }
                            placeholder="Teacher feedback note..."
                            className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs"
                          />
                          <button
                            onClick={() => handleGradeSubmission(sub.id)}
                            disabled={evaluatingLoading && evaluatingSubId === sub.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg text-xs shrink-0 disabled:opacity-50"
                          >
                            {evaluatingLoading && evaluatingSubId === sub.id ? "Saving..." : "Save Grade"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveSubmissionsAssignment(null)}
                  className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">New Assignment Task</h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assignment Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Kinematics Worksheet #3"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Class *</label>
                    <select
                      required
                      value={classId}
                      onChange={(e) => {
                        setClassId(e.target.value);
                        const c = classes.find((cl) => cl.id === e.target.value);
                        if (c?.sections?.length) setSectionId(c.sections[0].id);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Section *</label>
                    <select
                      required
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      {activeSections.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Subject *</label>
                    <select
                      required
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Max Score</label>
                    <input
                      type="number"
                      value={maxScore}
                      onChange={(e) => setMaxScore(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Instructions & Problem Prompts *</label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter coursework details..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
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
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>Assign Homework</span>
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
