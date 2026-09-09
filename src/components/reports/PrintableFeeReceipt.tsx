"use client";

import React from "react";
import { Printer, X, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PrintableFeeReceiptProps {
  schoolName: string;
  studentName: string;
  rollNumber: string;
  className: string;
  invoiceNumber: string;
  receiptNumber: string;
  transactionId: string;
  paymentDate: string | Date;
  paymentMethod: string;
  title: string;
  amount: number;
  onClose: () => void;
}

export function PrintableFeeReceipt({
  schoolName,
  studentName,
  rollNumber,
  className,
  invoiceNumber,
  receiptNumber,
  transactionId,
  paymentDate,
  paymentMethod,
  title,
  amount,
  onClose,
}: PrintableFeeReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        {/* Controls - Hidden during print */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between no-print">
          <span className="text-sm font-semibold text-slate-700">Official Fee Receipt</span>
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

        {/* Printable Area */}
        <div className="p-8 text-slate-900 bg-white relative">
          {/* PAID Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <span className="text-8xl font-black rotate-[-25deg] text-emerald-950 uppercase">
              PAID
            </span>
          </div>

          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900">{schoolName}</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Official Fee Collection Department</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Payment Receipt &bull; Fully Settled</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Receipt Number:</span>
              <span className="font-mono font-bold text-slate-900">{receiptNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Invoice Number:</span>
              <span className="font-mono font-bold text-slate-900">{invoiceNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Payment Date:</span>
              <span className="font-bold text-slate-900">{formatDate(paymentDate)}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Payment Method:</span>
              <span className="font-bold text-slate-900">{paymentMethod}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block font-medium">Transaction Reference:</span>
              <span className="font-mono text-slate-700">{transactionId}</span>
            </div>
          </div>

          <div className="py-4 border-b border-slate-200 text-xs">
            <span className="text-slate-400 block font-medium mb-1">Student Particulars:</span>
            <div className="flex justify-between font-bold text-slate-900">
              <span>{studentName} (Roll: {rollNumber})</span>
              <span>Class: {className}</span>
            </div>
          </div>

          <div className="my-6">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase">
                <tr>
                  <th className="py-2 text-left">Description</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3 text-slate-900">{title}</td>
                  <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(amount)}</td>
                </tr>
              </tbody>
              <tfoot className="border-t-2 border-slate-900 font-bold text-slate-900">
                <tr>
                  <td className="py-3 text-sm uppercase">Total Settled:</td>
                  <td className="py-3 text-right text-base text-emerald-700">{formatCurrency(amount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p>System-generated verifiable digital receipt.</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Uprank Financial Engine</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800">Finance Accounts Officer</p>
              <p className="text-[10px] text-slate-400">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
