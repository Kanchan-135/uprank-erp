"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  User,
  BookOpen,
  Pencil,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

export default function AdminTimetablePage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [slotSubjectId, setSlotSubjectId] = useState("");
  const [slotTeacherId, setSlotTeacherId] = useState("");
  const [slotDay, setSlotDay] = useState("MONDAY");
  const [slotStartTime, setSlotStartTime] = useState("08:30");
  const [slotEndTime, setSlotEndTime] = useState("09:20");
  const [slotRoom, setSlotRoom] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

  const loadAcademics = () => {
    fetch("/api/admin/academics")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.classes?.length > 0) {
          setClasses(json.data.classes);
          setSubjects(json.data.subjects || []);
          setSelectedClass(json.data.classes[0].id);
          if (json.data.classes[0].sections?.length > 0) {
            setSelectedSection(json.data.classes[0].sections[0].id);
          }
        }
      });

    fetch("/api/admin/teachers")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setTeachers(json.data || []);
      });
  };

  useEffect(() => {
    loadAcademics();
  }, []);

  const loadSlots = () => {
    if (!selectedClass) return;
    setLoading(true);
    let url = `/api/admin/timetable?classId=${selectedClass}`;
    if (selectedSection) url += `&sectionId=${selectedSection}`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setSlots(json.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSlots();
  }, [selectedClass, selectedSection]);

  const handleOpenAddModal = (defaultDay = "MONDAY") => {
    setEditingSlot(null);
    setSlotDay(defaultDay);
    setSlotSubjectId(subjects[0]?.id || "");
    setSlotTeacherId(teachers[0]?.id || "");
    setSlotStartTime("08:30");
    setSlotEndTime("09:20");
    setSlotRoom("Room 101");
    setModalOpen(true);
  };

  const handleOpenEditModal = (slot: any) => {
    setEditingSlot(slot);
    setSlotDay(slot.dayOfWeek);
    setSlotSubjectId(slot.subjectId);
    setSlotTeacherId(slot.teacherId);
    setSlotStartTime(slot.startTime);
    setSlotEndTime(slot.endTime);
    setSlotRoom(slot.roomNumber || "");
    setModalOpen(true);
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Are you sure you want to delete this period slot?")) return;
    try {
      const res = await fetch(`/api/admin/timetable?id=${slotId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        loadSlots();
      } else {
        alert(data.error || "Failed to delete period slot");
      }
    } catch {
      alert("Network error");
    }
  };

  const handleSubmitSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedSection) {
      alert("Please select both a class and a division/section first.");
      return;
    }
    setSubmitting(true);

    try {
      const payload = {
        classId: selectedClass,
        sectionId: selectedSection,
        subjectId: slotSubjectId,
        teacherId: slotTeacherId,
        dayOfWeek: slotDay,
        startTime: slotStartTime,
        endTime: slotEndTime,
        roomNumber: slotRoom,
      };

      let res;
      if (editingSlot) {
        res = await fetch("/api/admin/timetable", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingSlot.id, ...payload }),
        });
      } else {
        res = await fetch("/api/admin/timetable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        loadSlots();
      } else {
        alert(data.error || "Failed to save timetable period");
      }
    } catch {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const currentClassObj = classes.find((c) => c.id === selectedClass);
  const currentSections = currentClassObj?.sections || [];

  return (
    <DashboardLayout allowedRoles={["SCHOOL_ADMIN", "SUPER_ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Master Timetable</h1>
            <p className="text-xs text-slate-500 mt-1">
              Classroom scheduling, period allocations, and editable weekly faculty timetables
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Class Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  const c = classes.find((cl) => cl.id === e.target.value);
                  if (c?.sections?.length) setSelectedSection(c.sections[0].id);
                  else setSelectedSection("");
                }}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 bg-white shadow-xs"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Section / Division Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Division:</span>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 bg-white shadow-xs"
              >
                {currentSections.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Period Button */}
            <button
              onClick={() => handleOpenAddModal()}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Period</span>
            </button>
          </div>
        </div>

        {/* Weekly Timetable Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {days.map((day) => {
            const daySlots = slots.filter((s) => s.dayOfWeek === day);

            return (
              <div key={day} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
                <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between rounded-t-2xl">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">{day}</h3>
                    <span className="text-[10px] text-slate-400">{daySlots.length} Scheduled</span>
                  </div>
                  <button
                    onClick={() => handleOpenAddModal(day)}
                    className="p-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title={`Add period to ${day}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 space-y-2.5 flex-1 min-h-[300px]">
                  {loading ? (
                    <div className="h-40 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    </div>
                  ) : daySlots.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-xs text-slate-400 italic gap-2">
                      <span>No periods scheduled</span>
                      <button
                        onClick={() => handleOpenAddModal(day)}
                        className="text-[11px] text-indigo-600 font-semibold hover:underline not-italic"
                      >
                        + Add first period
                      </button>
                    </div>
                  ) : (
                    daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group relative"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700">
                            <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span>
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </span>
                          </div>

                          {/* Quick Edit/Delete buttons */}
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={() => handleOpenEditModal(slot)}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                              title="Edit Period Slot"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Delete Period Slot"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{slot.subject?.name}</h4>

                        <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-col gap-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {slot.teacher?.profile?.firstName} {slot.teacher?.profile?.lastName}
                            </span>
                          </div>
                          {slot.roomNumber && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="font-medium text-slate-500">{slot.roomNumber}</span>
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

        {/* Add / Edit Period Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    {editingSlot ? "Edit Timetable Period" : "Add Timetable Period"}
                  </h3>
                </div>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitSlot} className="mt-4 space-y-3.5 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Class &amp; Division:</span>
                  <span className="text-xs font-bold text-slate-900">
                    {currentClassObj?.name} &bull; {currentSections.find((s: any) => s.id === selectedSection)?.name || "Default Section"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Day of Week *</label>
                    <select
                      value={slotDay}
                      onChange={(e) => setSlotDay(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      {days.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Room / Lab</label>
                    <input
                      type="text"
                      value={slotRoom}
                      onChange={(e) => setSlotRoom(e.target.value)}
                      placeholder="e.g. Room 204"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Start Time *</label>
                    <input
                      type="time"
                      required
                      value={slotStartTime}
                      onChange={(e) => setSlotStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">End Time *</label>
                    <input
                      type="time"
                      required
                      value={slotEndTime}
                      onChange={(e) => setSlotEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Course / Subject *</label>
                  <select
                    required
                    value={slotSubjectId}
                    onChange={(e) => setSlotSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Instructor / Teacher *</label>
                  <select
                    required
                    value={slotTeacherId}
                    onChange={(e) => setSlotTeacherId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.profile?.firstName} {t.profile?.lastName} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>{editingSlot ? "Save Changes" : "Create Period"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

