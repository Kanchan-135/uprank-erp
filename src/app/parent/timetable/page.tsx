"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  CalendarDays,
  Clock,
  BookOpen,
  User,
  GraduationCap,
  MapPin,
  Printer,
  ChevronDown,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function ParentTimetablePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [selectedDay, setSelectedDay] = useState("MONDAY");

  const loadTimetable = (childId?: string) => {
    const url = childId ? `/api/parent/timetable?childId=${childId}` : "/api/parent/timetable";
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
          if (!selectedChildId && json.data.activeChild?.id) {
            setSelectedChildId(json.data.activeChild.id);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTimetable();
  }, []);

  const handleChildSwitch = (childId: string) => {
    setSelectedChildId(childId);
    loadTimetable(childId);
  };

  const activeChild = data?.activeChild;
  const classTeacher = data?.classTeacher;
  const timetable = data?.timetable || [];

  const dayPeriods = timetable.filter((p: any) => p.dayOfWeek === selectedDay);

  return (
    <DashboardLayout allowedRoles={["PARENT"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Class Timetable: {activeChild?.name || "Child"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              View your child&apos;s daily period schedule, classroom allocations, and faculty assignments
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Child Switcher if parent has multiple children */}
            {data?.children?.length > 1 && (
              <div className="relative">
                <select
                  value={selectedChildId}
                  onChange={(e) => handleChildSwitch(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-lg pr-8 shadow-xs"
                >
                  {data.children.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.className}-{c.sectionName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Timetable</span>
            </button>
          </div>
        </div>

        {/* Child & Class Teacher Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Class & Section</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {activeChild?.className} &bull; Section {activeChild?.sectionName}
              </div>
              <div className="text-xs text-slate-500">Roll No: {activeChild?.rollNumber}</div>
            </div>
          </div>

          <div className="sm:col-span-2 bg-gradient-to-r from-indigo-50/80 to-white rounded-2xl border border-indigo-100/80 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                {classTeacher ? classTeacher.name.charAt(0) : "T"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Designated Class Teacher
                  </span>
                </div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {classTeacher?.name || "Class Teacher Assigned"}
                </div>
                <div className="text-xs text-slate-500">
                  {classTeacher?.email} &bull; {classTeacher?.phone}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          {DAYS.map((day) => {
            const count = timetable.filter((p: any) => p.dayOfWeek === day).length;
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
                }`}
              >
                <span>{day.charAt(0) + day.slice(1).toLowerCase()}</span>
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Schedule List / Cards */}
        {dayPeriods.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No scheduled periods for {selectedDay}</h3>
            <p className="text-xs text-slate-500 mt-1">This day is currently configured as a revision, sports, or rest day.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dayPeriods.map((slot: any, idx: number) => {
              const teacherName = slot.teacher?.profile
                ? `${slot.teacher.profile.firstName} ${slot.teacher.profile.lastName}`
                : "Faculty Instructor";

              return (
                <div
                  key={slot.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Period #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <span>{slot.subject?.name || "Subject Lecture"}</span>
                    </h3>
                    {slot.subject?.code && (
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        Code: {slot.subject.code}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{teacherName}</span>
                    </div>
                    {slot.roomNumber && (
                      <div className="flex items-center gap-1 font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        <MapPin className="w-3 h-3" />
                        <span>Room {slot.roomNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
