import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "indigo" | "emerald" | "amber" | "rose" | "purple" | "blue";
  badge?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "indigo",
  badge,
}: StatsCardProps) {
  const colorMap = {
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100/80",
      pill: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100/80",
      pill: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100/80",
      pill: "bg-amber-50 text-amber-700 border-amber-200/80",
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-100/80",
      pill: "bg-rose-50 text-rose-700 border-rose-200/80",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100/80",
      pill: "bg-purple-50 text-purple-700 border-purple-200/80",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100/80",
      pill: "bg-blue-50 text-blue-700 border-blue-200/80",
    },
  };

  const scheme = colorMap[color];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105", scheme.bg, scheme.text, scheme.border)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3.5">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">{value}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-1.5 font-medium leading-normal">{subtitle}</p>}
        {badge && (
          <span className={cn("inline-block mt-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full border", scheme.pill)}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
