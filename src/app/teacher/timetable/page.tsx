"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Clock, MapPin, CalendarDays } from "lucide-react";
import { formatTime } from "@/lib/utils";

export default function TeacherTimetablePage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

  useEffect(() => {
    fetch("/api/teacher/timetable")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setSlots(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout allowedRoles={["TEACHER"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personal Teaching Schedule</h1>
          <p className="text-xs text-slate-500 mt-1">Weekly classroom periods, assigned subjects, and room locations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {days.map((day) => {
            const daySlots = slots.filter((s) => s.dayOfWeek === day);

            return (
              <div key={day} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
                <div className="p-3.5 bg-slate-50 border-b border-slate-100 text-center rounded-t-2xl">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">{day}</h3>
                  <span className="text-[10px] text-slate-400">{daySlots.length} Classes</span>
                </div>

                <div className="p-3 space-y-2.5 flex-1">
                  {daySlots.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-xs text-slate-400 italic">
                      No classes scheduled
                    </div>
                  ) : (
                    daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100"
                      >
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 mb-1">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          <span>
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{slot.subject?.name}</h4>
                        <div className="mt-2 pt-2 border-t border-indigo-100/60 flex flex-col gap-1 text-[11px] text-slate-600">
                          <span className="font-semibold text-slate-700">
                            {slot.class?.name} - {slot.section?.name}
                          </span>
                          {slot.roomNumber && (
                            <div className="flex items-center gap-1 text-slate-500">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{slot.roomNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
