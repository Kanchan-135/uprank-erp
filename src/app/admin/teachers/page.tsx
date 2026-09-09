"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { UserPlus, Search, X, Loader2, Mail, Phone, BookOpen, GraduationCap, PlusCircle, Award, CheckCircle2, Users } from "lucide-react";

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Add Faculty Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Assign Subject Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState<any>(null);
  const [assignClassId, setAssignClassId] = useState("");
  const [assignSectionId, setAssignSectionId] = useState("");
  const [assignSubjectId, setAssignSubjectId] = useState("");
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // Class Teacher Modal
  const [classTeacherModalOpen, setClassTeacherModalOpen] = useState(false);
  const [selectedTeacherForClassTeacher, setSelectedTeacherForClassTeacher] = useState<any>(null);
  const [editClassId, setEditClassId] = useState("");
  const [editSectionId, setEditSectionId] = useState("");
  const [classTeacherSubmitting, setClassTeacherSubmitting] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [qualification, setQualification] = useState("");
  const [gender, setGender] = useState("FEMALE");
  const [primaryClassId, setPrimaryClassId] = useState("");
  const [primarySectionId, setPrimarySectionId] = useState("");

  const loadData = () => {
    fetch("/api/admin/teachers")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setTeachers(json.data);
      })
      .finally(() => setLoading(false));

    fetch("/api/admin/academics")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setClasses(json.data.classes || []);
          setSubjects(json.data.subjects || []);
          if (json.data.classes?.length > 0) {
            setAssignClassId(json.data.classes[0].id);
            if (json.data.classes[0].sections?.length > 0) {
              setAssignSectionId(json.data.classes[0].sections[0].id);
            }
          }
          if (json.data.subjects?.length > 0) {
            setAssignSubjectId(json.data.subjects[0].id);
          }
        }
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          designation,
          qualification,
          gender,
          primaryClassId: primaryClassId || null,
          primarySectionId: primarySectionId || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setDesignation("");
        setQualification("");
        setPrimaryClassId("");
        setPrimarySectionId("");
        loadData();
      } else {
        alert(data.error || "Failed to add faculty member");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForAssign) return;
    setAssignSubmitting(true);

    try {
      const res = await fetch("/api/admin/teachers/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: selectedTeacherForAssign.id,
          classId: assignClassId,
          sectionId: assignSectionId,
          subjectId: assignSubjectId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAssignModalOpen(false);
        loadData();
      } else {
        alert(data.error || "Failed to assign course");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleSaveClassTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForClassTeacher) return;
    setClassTeacherSubmitting(true);

    try {
      const res = await fetch("/api/admin/teachers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: selectedTeacherForClassTeacher.id,
          primaryClassId: editClassId || null,
          primarySectionId: editSectionId || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setClassTeacherModalOpen(false);
        loadData();
      } else {
        alert(data.error || "Failed to update Class Teacher assignment");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setClassTeacherSubmitting(false);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const fullName = `${t.profile?.firstName} ${t.profile?.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase());
  });

  const activeAssignSections = classes.find((c) => c.id === assignClassId)?.sections || [];
  const activeEditSections = classes.find((c) => c.id === editClassId)?.sections || [];
  const activeNewSections = classes.find((c) => c.id === primaryClassId)?.sections || [];

  return (
    <DashboardLayout allowedRoles={["SCHOOL_ADMIN", "SUPER_ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty & Staff Directory</h1>
            <p className="text-xs text-slate-500 mt-1">Manage teaching personnel, assign primary Class Teachers, and allocate courses</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Faculty Member</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search faculty by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Teachers Grid */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-slate-200/80">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-xs text-slate-500">Loading faculty directory...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Faculty Members Found"
            description={
              search
                ? `No teachers match your search term "${search}".`
                : "No teachers or faculty members added yet."
            }
            action={
              search
                ? {
                    label: "Clear Search",
                    onClick: () => setSearch(""),
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTeachers.map((t) => (
              <div key={t.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-base border border-emerald-100">
                        {t.profile?.firstName?.[0]}
                        {t.profile?.lastName?.[0]}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {t.profile?.firstName} {t.profile?.lastName}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">{t.profile?.designation || "Faculty"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedTeacherForClassTeacher(t);
                          setEditClassId(t.primaryClassId || (classes[0]?.id || ""));
                          const c = classes.find((cl) => cl.id === (t.primaryClassId || classes[0]?.id));
                          setEditSectionId(t.primarySectionId || (c?.sections?.[0]?.id || ""));
                          setClassTeacherModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 border border-amber-200 text-xs font-semibold flex items-center gap-1"
                        title="Assign / Change Primary Class & Division (Class Teacher)"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[10px]">Class Teacher</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTeacherForAssign(t);
                          setAssignModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-indigo-100 text-xs font-semibold flex items-center gap-1"
                        title="Assign Subject to Teacher"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Assign</span>
                      </button>
                    </div>
                  </div>

                  {/* Class Teacher Badge */}
                  {t.primaryClass && t.primarySection ? (
                    <div className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                      <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Class Teacher &bull; {t.primaryClass.name} ({t.primarySection.name})</span>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 text-[11px]">
                      <span>No Class Teacher Assignment</span>
                    </div>
                  )}

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.email}</span>
                    </div>
                    {t.profile?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.profile.phone}</span>
                      </div>
                    )}
                    {t.profile?.qualification && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.profile.qualification}</span>
                      </div>
                    )}
                  </div>

                  {/* Assigned Subjects & Classes */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Assigned Courses ({t.teacherAssignments?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {t.teacherAssignments?.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">No courses currently assigned</span>
                      ) : (
                        t.teacherAssignments?.map((a: any) => (
                          <span
                            key={a.id}
                            className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded"
                          >
                            {a.subject?.name} ({a.class?.name})
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Class Teacher Assignment Modal */}
        {classTeacherModalOpen && selectedTeacherForClassTeacher && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-slate-900">Assign Class Teacher</h3>
                </div>
                <button onClick={() => setClassTeacherModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveClassTeacher} className="mt-4 space-y-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Faculty Member:</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedTeacherForClassTeacher.profile?.firstName} {selectedTeacherForClassTeacher.profile?.lastName}
                  </p>
                  <p className="text-[11px] text-slate-500">{selectedTeacherForClassTeacher.email}</p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Primary Class *</label>
                  <select
                    value={editClassId}
                    onChange={(e) => {
                      setEditClassId(e.target.value);
                      const c = classes.find((cl) => cl.id === e.target.value);
                      if (c?.sections?.length) setEditSectionId(c.sections[0].id);
                      else setEditSectionId("");
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="">-- None (Remove Class Teacher Role) --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Primary Division / Section *</label>
                  <select
                    value={editSectionId}
                    onChange={(e) => setEditSectionId(e.target.value)}
                    disabled={!editClassId}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white disabled:opacity-50"
                  >
                    <option value="">-- Select Division --</option>
                    {activeEditSections.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    This teacher will be officially designated and displayed as the Class Teacher for this class and division.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setClassTeacherModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={classTeacherSubmitting}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-lg"
                  >
                    {classTeacherSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Save Class Teacher</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Subject Modal */}
        {assignModalOpen && selectedTeacherForAssign && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Assign Course to Faculty</h3>
                <button onClick={() => setAssignModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignCourse} className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Faculty Member:</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedTeacherForAssign.profile?.firstName} {selectedTeacherForAssign.profile?.lastName}
                  </p>
                  <p className="text-[11px] text-slate-500">{selectedTeacherForAssign.email}</p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Class *</label>
                  <select
                    required
                    value={assignClassId}
                    onChange={(e) => {
                      setAssignClassId(e.target.value);
                      const c = classes.find((cl) => cl.id === e.target.value);
                      if (c?.sections?.length) setAssignSectionId(c.sections[0].id);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Section *</label>
                  <select
                    required
                    value={assignSectionId}
                    onChange={(e) => setAssignSectionId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    {activeAssignSections.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Course / Subject *</label>
                  <select
                    required
                    value={assignSubjectId}
                    onChange={(e) => setAssignSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAssignModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assignSubmitting}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg"
                  >
                    {assignSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                    <span>Confirm Assignment</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Add Faculty Member</h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTeacher} className="mt-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Maria"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Garcia"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email (Login ID) *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maria.garcia@greenwood.edu"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option value="FEMALE">Female</option>
                      <option value="MALE">Male</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Designation / Role Title</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Biology & Chemistry Lead"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Qualifications & Degrees</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. M.Sc. Molecular Biology, B.Ed."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-800 block mb-2 text-xs">Primary Class & Division (Class Teacher)</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-medium text-slate-600 block mb-1">Primary Class</label>
                      <select
                        value={primaryClassId}
                        onChange={(e) => {
                          setPrimaryClassId(e.target.value);
                          const c = classes.find((cl) => cl.id === e.target.value);
                          if (c?.sections?.length) setPrimarySectionId(c.sections[0].id);
                          else setPrimarySectionId("");
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      >
                        <option value="">None (Subject Teacher)</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-medium text-slate-600 block mb-1">Primary Division</label>
                      <select
                        value={primarySectionId}
                        onChange={(e) => setPrimarySectionId(e.target.value)}
                        disabled={!primaryClassId}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white disabled:opacity-50"
                      >
                        <option value="">None</option>
                        {activeNewSections.map((s: any) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
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
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    <span>Add Faculty</span>
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
