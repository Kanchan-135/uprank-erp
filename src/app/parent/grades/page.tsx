"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Award, Printer, BookOpen } from "lucide-react";
import { PrintableReportCard } from "@/components/reports/PrintableReportCard";

export default function ParentGradesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReportCard, setSelectedReportCard] = useState<any>(null);

  useEffect(() => {
    fetch("/api/parent/overview")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeChild = data?.activeChild;
  const examResults = data?.examResults || [];

  return (
    <DashboardLayout allowedRoles={["PARENT"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Academic Report Card: {activeChild?.name || "Child"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">Official term exam grades, subject assessments, and downloadable transcripts</p>
          </div>

          {examResults.length > 0 && (
            <button
              onClick={() =>
                setSelectedReportCard({
                  schoolName: "Greenwood International Academy",
                  studentName: activeChild?.name || "Student",
                  rollNumber: activeChild?.rollNumber || "101",
                  className: activeChild?.className || "Grade 10",
                  sectionName: activeChild?.sectionName || "Section A",
                  academicYear: "2024-2025",
                  examName: examResults[0]?.examSubject?.exam?.name || "Mid-Term Examination",
                  termName: "Term 1 (Fall)",
                  subjects: examResults.map((r: any) => ({
                    subjectName: r.examSubject?.subject?.name || "Subject",
                    subjectCode: r.examSubject?.subject?.code || "CODE",
                    marksObtained: r.marksObtained,
                    maxMarks: r.examSubject?.maxMarks || 100,
                    grade: r.grade,
                    remarks: r.remarks,
                  })),
                })
              }
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Report Card</span>
            </button>
          )}
        </div>

        {/* Scores Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Exam Results & Subject Breakdown</span>
            <span className="text-xs text-slate-500">{examResults.length} Evaluated Courses</span>
          </div>

          <div className="table-responsive-container">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Code</th>
                  <th className="p-4 text-center">Marks Obtained</th>
                  <th className="p-4 text-center">Letter Grade</th>
                  <th className="p-4">Faculty Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {examResults.map((res: any) => (
                  <tr key={res.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">{res.examSubject?.subject?.name}</td>
                    <td className="p-4 font-mono text-slate-500">{res.examSubject?.subject?.code}</td>
                    <td className="p-4 text-center font-bold text-slate-900 text-sm">
                      {res.marksObtained} / {res.examSubject?.maxMarks}
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                        {res.grade}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 italic">{res.remarks || "Satisfactory understanding"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Printable Report Card Modal */}
        {selectedReportCard && (
          <PrintableReportCard {...selectedReportCard} onClose={() => setSelectedReportCard(null)} />
        )}
      </div>
    </DashboardLayout>
  );
}
