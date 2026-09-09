"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FileText, Send, Calendar, CheckCircle2, Loader2, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAssignment, setModalAssignment] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAssignments = () => {
    fetch("/api/student/assignments")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setAssignments(json.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAssignment) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: modalAssignment.id,
          content: submissionText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalAssignment(null);
        setSubmissionText("");
        loadAssignments();
      } else {
        alert(data.error || "Failed to submit coursework");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["STUDENT"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Homework & Coursework Tasks</h1>
          <p className="text-xs text-slate-500 mt-1">Review active assignments, upload work, and view teacher grading</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {assignments.map((item) => {
            const submission = item.submissions?.[0];
            const isSubmitted = !!submission;

            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {item.subject?.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600">Max: {item.maxScore} pts</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-4">{item.description}</p>

                  {submission && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-700">My Submission</span>
                        {submission.score !== null ? (
                          <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                            Grade: {submission.score} / {item.maxScore}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-bold">Awaiting Scoring</span>
                        )}
                      </div>
                      <p className="text-slate-600 italic">"{submission.content}"</p>
                      {submission.feedback && (
                        <p className="mt-1 text-emerald-700 font-medium">Feedback: {submission.feedback}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due: {formatDate(item.dueDate)}</span>
                  </div>

                  <button
                    onClick={() => {
                      setModalAssignment(item);
                      setSubmissionText(submission?.content || "");
                    }}
                    className={`font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors ${
                      isSubmitted
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                    }`}
                  >
                    {isSubmitted ? "Update Submission" : "Submit Work"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Modal */}
        {modalAssignment && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">
                    {modalAssignment.subject?.name}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{modalAssignment.title}</h3>
                </div>
                <button onClick={() => setModalAssignment(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitWork} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Your Answers & Submission Details *</label>
                  <textarea
                    rows={6}
                    required
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Enter completed solutions, answer text, or repository links..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalAssignment(null)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Submit Work to Faculty</span>
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
