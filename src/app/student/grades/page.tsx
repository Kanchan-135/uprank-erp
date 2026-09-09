"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Award, Printer, ArrowUpRight, BookOpen } from "lucide-react";
import { PrintableReportCard } from "@/components/reports/PrintableReportCard";

export default function StudentGradesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReportCard, setSelectedReportCard] = useState<any>(null);

  useEffect(() => {
    fetch("/api/student/grades")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout allowedRoles={["STUDENT"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Performance & Transcripts</h1>
            <p className="text-xs text-slate-500 mt-1">Examination scores, subject-wise GPA grades, and printable transcripts</p>
          </div>
        </div>

        {/* Exams List */}
        <div className="space-y-6">
          {data?.exams?.map((exam: any, idx: number) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                <div>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                    {exam.term}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{exam.examName}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-medium block">Aggregate Score</span>
                    <span className="text-base font-bold text-slate-900">
                      {exam.totalObtained} / {exam.totalMax} ({exam.percentage}%)
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setSelectedReportCard({
                        schoolName: "Greenwood International Academy",
                        studentName: `${data.enrollment?.student?.profile?.firstName || "Alex"} ${data.enrollment?.student?.profile?.lastName || "Morgan"}`,
                        rollNumber: data.enrollment?.rollNumber || "101",
                        className: data.enrollment?.class?.name || "Grade 10",
                        sectionName: data.enrollment?.section?.name || "Section A",
                        academicYear: data.enrollment?.academicYear?.name || "2024-2025",
                        examName: exam.examName,
                        termName: exam.term,
                        subjects: exam.subjects,
                      })
                    }
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors shadow-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Report Card</span>
                  </button>
                </div>
              </div>

              {/* Subject Breakdown */}
              <div className="table-responsive-container">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Subject Name</th>
                      <th className="p-4">Code</th>
                      <th className="p-4 text-center">Marks Scored</th>
                      <th className="p-4 text-center">Max Marks</th>
                      <th className="p-4 text-center">Letter Grade</th>
                      <th className="p-4">Faculty Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {exam.subjects?.map((sub: any, sIdx: number) => (
                      <tr key={sIdx} className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-900">{sub.subjectName}</td>
                        <td className="p-4 font-mono text-slate-500">{sub.subjectCode}</td>
                        <td className="p-4 text-center font-bold text-slate-900 text-sm">{sub.marksObtained}</td>
                        <td className="p-4 text-center text-slate-500">{sub.maxMarks}</td>
                        <td className="p-4 text-center">
                          <span className="font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                            {sub.grade}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 italic">{sub.remarks || "Strong academic understanding."}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Printable Report Card Modal */}
        {selectedReportCard && (
          <PrintableReportCard {...selectedReportCard} onClose={() => setSelectedReportCard(null)} />
        )}
      </div>
    </DashboardLayout>
  );
}
