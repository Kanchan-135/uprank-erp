"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  CreditCard,
  Bell,
  ClipboardCheck,
  Award,
  FileText,
  ShieldCheck,
  UserCheck,
  Sparkles,
  School,
  Download,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePwa } from "@/context/PwaContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isInstallable, promptInstall } = usePwa();

  if (!user) return null;

  const role = user.role;

  const getNavItems = () => {
    switch (role) {
      case "SUPER_ADMIN":
        return [
          { name: "Global Overview", href: "/super-admin/dashboard", icon: LayoutDashboard },
          { name: "Schools & Tenants", href: "/super-admin/schools", icon: Building2 },
          { name: "Subscription Plans", href: "/super-admin/subscriptions", icon: Sparkles },
          { name: "Platform Audit Logs", href: "/super-admin/audit-logs", icon: ShieldCheck },
        ];
      case "SCHOOL_ADMIN":
        return [
          { name: "School Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
          { name: "Students & Admissions", href: "/admin/students", icon: GraduationCap },
          { name: "Faculty & Staff", href: "/admin/teachers", icon: Users },
          { name: "Academics & Classes", href: "/admin/academics", icon: BookOpen },
          { name: "Fee Management", href: "/admin/fees", icon: CreditCard },
          { name: "Timetable Schedule", href: "/admin/timetable", icon: CalendarDays },
          { name: "Examinations", href: "/admin/exams", icon: Award },
          { name: "Circulars & Notices", href: "/admin/notices", icon: Bell },
          { name: "Subscription", href: "/admin/subscription", icon: Sparkles },
        ];
      case "TEACHER":
        return [
          { name: "Teacher Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
          { name: "Daily Attendance", href: "/teacher/attendance", icon: ClipboardCheck },
          { name: "Digital Gradebook", href: "/teacher/gradebook", icon: Award },
          { name: "Assignments & Homework", href: "/teacher/assignments", icon: FileText },
          { name: "Weekly Timetable", href: "/teacher/timetable", icon: CalendarDays },
        ];
      case "STUDENT":
        return [
          { name: "Student Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
          { name: "Class Timetable", href: "/student/timetable", icon: CalendarDays },
          { name: "Attendance Records", href: "/student/attendance", icon: ClipboardCheck },
          { name: "Report Cards & Grades", href: "/student/grades", icon: Award },
          { name: "Fee Invoices & Dues", href: "/student/fees", icon: CreditCard },
          { name: "Homework & Tasks", href: "/student/assignments", icon: FileText },
        ];
      case "PARENT":
        return [
          { name: "Ward Overview", href: "/parent/dashboard", icon: LayoutDashboard },
          { name: "Ward Timetable", href: "/parent/timetable", icon: CalendarDays },
          { name: "Attendance Monitor", href: "/parent/attendance", icon: ClipboardCheck },
          { name: "Academic Report Card", href: "/parent/grades", icon: Award },
          { name: "Fee Pay & Receipts", href: "/parent/fees", icon: CreditCard },
          { name: "Leave Requests", href: "/parent/leaves", icon: UserCheck },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleBadge = () => {
    switch (role) {
      case "SUPER_ADMIN":
        return { label: "Super Admin", color: "bg-purple-50 text-purple-700 border-purple-200/80" };
      case "SCHOOL_ADMIN":
        return { label: "School Admin", color: "bg-blue-50 text-blue-700 border-blue-200/80" };
      case "TEACHER":
        return { label: "Faculty", color: "bg-emerald-50 text-emerald-700 border-emerald-200/80" };
      case "STUDENT":
        return { label: "Student", color: "bg-amber-50 text-amber-700 border-amber-200/80" };
      case "PARENT":
        return { label: "Parent", color: "bg-rose-50 text-rose-700 border-rose-200/80" };
      default:
        return { label: role, color: "bg-slate-100 text-slate-700 border-slate-200/80" };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 h-full min-h-screen select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
          <School className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-extrabold text-slate-900 tracking-tight leading-none text-base">Uprank ERP</h1>
          <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase tracking-wider">Enterprise Edition</p>
        </div>
      </div>

      {/* Role Pill */}
      <div className="px-5 py-3.5 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Portal Mode</span>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", roleBadge.color)}>
            {roleBadge.label}
          </span>
        </div>
        {user.schoolName && role !== "SUPER_ADMIN" && (
          <p className="text-xs font-semibold text-slate-700 truncate mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="truncate">{user.schoolName}</span>
          </p>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 group",
                isActive
                  ? "bg-indigo-50 text-indigo-700 shadow-2xs font-bold border border-indigo-100/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors shrink-0",
                  isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* PWA Install Promotion for Student, Teacher, Parent, School Admin */}
      {user.role !== "SUPER_ADMIN" && isInstallable && (
        <div className="mx-3 mb-3 p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100/80 shadow-2xs shrink-0">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Download className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900">Install Uprank App</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">Fast mobile & desktop offline access</p>
              <button
                onClick={() => promptInstall()}
                className="mt-2 w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors text-center"
              >
                Install Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Role Info Footer */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 shrink-0 safe-bottom">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs shrink-0">
            {user.firstName?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[10px] text-slate-500 truncate font-mono">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
