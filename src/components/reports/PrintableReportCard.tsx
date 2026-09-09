"use client";

import React from "react";
import { Printer, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface PrintableReportCardProps {
  schoolName: string;
  studentName: string;
  rollNumber: string;
  className: string;
  sectionName: string;
  academicYear: string;
  examName: string;
  termName: string;
  subjects: Array<{
    subjectName: string;
    subjectCode: string;
    marksObtained: number;
    maxMarks: number;
    grade: string;
    remarks?: string | null;
  }>;
  onClose: () => void;
}

export function PrintableReportCard({
  schoolName,
  studentName,
  rollNumber,
  className,
  sectionName,
  academicYear,
  examName,
  termName,
  subjects,
  onClose,
}: PrintableReportCardProps) {
  const totalObtained = subjects.reduce((sum, s) => sum + s.marksObtained, 0);
  const totalMax = subjects.reduce((sum, s) => sum + s.maxMarks, 0);
  const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : "0";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        {/* Controls - Hidden during print */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between no-print">
          <span className="text-sm font-semibold text-slate-700">Official Report Card Preview</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="p-8 md:p-12 text-slate-900 bg-white">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-6">
            <h1 className="text-2xl md:text-3xl font-serif font-black tracking-wide text-slate-950 uppercase">
              {schoolName}
            </h1>
            <p className="text-xs tracking-widest text-slate-600 font-semibold uppercase mt-1">
              Affiliated & Accredited Academic Institution
            </p>
            <div className="mt-4 inline-block bg-slate-900 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
              Official Student Performance Transcript
            </div>
          </div>

          {/* Student Meta Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Student Name:</span>
              <span className="font-bold text-slate-900 text-sm">{studentName}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Roll Number:</span>
              <span className="font-bold text-slate-900 text-sm">{rollNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Class & Section:</span>
              <span className="font-bold text-slate-900 text-sm">{className} - {sectionName}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Academic Session:</span>
              <span className="font-bold text-slate-900 text-sm">{academicYear}</span>
            </div>
          </div>

          {/* Examination Name */}
          <div className="py-3 text-center bg-slate-50 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              {examName} &bull; {termName}
            </span>
          </div>

          {/* Subject Scores Table */}
          <div className="mt-6">
            <table className="w-full text-left border border-slate-300 text-xs">
              <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Subject Name</th>
                  <th className="p-3 text-center">Code</th>
                  <th className="p-3 text-center">Max Marks</th>
                  <th className="p-3 text-center">Marks Scored</th>
                  <th className="p-3 text-center">Grade</th>
                  <th className="p-3">Faculty Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subjects.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">{sub.subjectName}</td>
                    <td className="p-3 text-center font-mono text-slate-600">{sub.subjectCode}</td>
                    <td className="p-3 text-center text-slate-600">{sub.maxMarks}</td>
                    <td className="p-3 text-center font-bold text-slate-900">{sub.marksObtained}</td>
                    <td className="p-3 text-center">
                      <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-300">
                        {sub.grade}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 italic">{sub.remarks || "Satisfactory"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900">
                <tr>
                  <td className="p-3 uppercase">Aggregate Totals</td>
                  <td className="p-3"></td>
                  <td className="p-3 text-center">{totalMax}</td>
                  <td className="p-3 text-center text-sm">{totalObtained}</td>
                  <td className="p-3 text-center text-indigo-700">{percentage}%</td>
                  <td className="p-3 text-emerald-700 font-bold">Passed with Distinction</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures */}
          <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="border-b border-slate-400 pb-1 mb-2 font-serif italic text-slate-600">Sarah Jenkins</div>
              <span className="font-bold text-slate-700">Class Teacher</span>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-1 mb-2 font-serif italic text-slate-600">Dr. Jonathan Vance</div>
              <span className="font-bold text-slate-700">Principal</span>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-1 mb-2 text-slate-400">[ Institutional Seal ]</div>
              <span className="font-bold text-slate-700">Official Stamp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
