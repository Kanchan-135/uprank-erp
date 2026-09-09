"use client";

import React, { useState, useEffect, useRef } from "react";
import { LogOut, Bell, Menu, ShieldCheck, Building2, Users, GraduationCap, Heart, User as UserIcon, Download, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePwa } from "@/context/PwaContext";
import { UserRole } from "@/types";
import { formatDate } from "@/lib/utils";

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

const roleConfigs: Record<
  UserRole,
  { label: string; badgeClass: string; dotClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200/80",
    dotClass: "bg-purple-500",
    icon: ShieldCheck,
  },
  SCHOOL_ADMIN: {
    label: "School Admin",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200/80",
    dotClass: "bg-blue-500",
    icon: Building2,
  },
  TEACHER: {
    label: "Faculty",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dotClass: "bg-emerald-500",
    icon: Users,
  },
  STUDENT: {
    label: "Student",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80",
    dotClass: "bg-amber-500",
    icon: GraduationCap,
  },
  PARENT: {
    label: "Parent",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80",
    dotClass: "bg-rose-500",
    icon: Heart,
  },
};

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const { user, logout } = useAuth();
  const { isInstallable, promptInstall } = usePwa();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/notices")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setNotices(json.data.slice(0, 4));
        }
      })
      .catch(() => {});
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    if (notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsOpen]);

  const currentRoleConfig = user?.role ? roleConfigs[user.role] : null;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs safe-top">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Mobile Menu Button */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {user?.schoolName && user.role !== "SUPER_ADMIN" ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[130px] sm:max-w-xs">
              {user.schoolName}
            </span>
            <span className="hidden sm:inline-block text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200/60 font-mono shrink-0">
              Session 2024-2025
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              Global Multi-Tenant Administration
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* PWA Install Button (Excluded for Super Admin) */}
        {user?.role !== "SUPER_ADMIN" && isInstallable && (
          <button
            onClick={() => promptInstall()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-all shadow-2xs shrink-0"
            title="Install Uprank App on your device"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="hidden md:inline">Install App</span>
          </button>
        )}

        {/* Campus Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
            title="School Circulars"
            aria-label="Campus Announcements"
          >
            <Bell className="w-4 h-4" />
            {notices.some((n) => n.isUrgent) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Campus Announcements
                </span>
                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                  {notices.length} Recent
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notices.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 italic">No new campus announcements.</div>
                ) : (
                  notices.map((n) => (
                    <div key={n.id} className="p-3.5 hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{n.title}</h4>
                        {n.isUrgent && (
                          <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded shrink-0">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{n.content}</p>
                      <span className="text-[10px] text-slate-400 block mt-1 font-mono">{formatDate(n.publishDate)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Authenticated User Identity Display */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-2.5 py-1 rounded-xl bg-slate-50/80 border border-slate-200/80 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-2xs">
              {user.firstName ? user.firstName[0].toUpperCase() : "U"}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">
                {user.email}
              </div>
            </div>
            {currentRoleConfig && (
              <span
                className={`hidden lg:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentRoleConfig.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${currentRoleConfig.dotClass}`} />
                {currentRoleConfig.label}
              </span>
            )}
          </div>
        )}

        {/* Sign Out Button */}
        <div className="flex items-center pl-1 sm:pl-2 border-l border-slate-200/80">
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-red-600 p-2 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-red-50 transition-colors"
            title="Sign Out of Session"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
