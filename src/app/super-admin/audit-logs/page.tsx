"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ShieldCheck, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function SuperAdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/super-admin/audit-logs")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setLogs(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout allowedRoles={["SUPER_ADMIN"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Audit & Security Logs</h1>
          <p className="text-xs text-slate-500 mt-1">Immutable trail of administrative events, tenant operations, and authentication</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="table-responsive-container">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action Event</th>
                  <th className="p-4">Initiated By</th>
                  <th className="p-4">Associated Institution</th>
                  <th className="p-4">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-4">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      {log.user ? (
                        <div>
                          <div className="font-semibold text-slate-800">
                            {log.user.profile?.firstName} {log.user.profile?.lastName}
                          </div>
                          <div className="text-[10px] text-slate-400">{log.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">System</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-700 font-medium">
                      {log.school ? log.school.name : "Platform Wide"}
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{log.details}</td>
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
