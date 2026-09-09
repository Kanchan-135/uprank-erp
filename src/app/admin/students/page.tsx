"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { UserPlus, Search, X, Loader2, Filter, Mail, Phone, Edit3, DollarSign, Calendar, Users } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  // Add Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Add Form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("MALE");
  const [dob, setDob] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [address, setAddress] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentFirstName, setParentFirstName] = useState("");
  const [parentLastName, setParentLastName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [relationship, setRelationship] = useState("FATHER");
  const [totalFees, setTotalFees] = useState("4500");
  const [paidFees, setPaidFees] = useState("0");
  const [feeDueDate, setFeeDueDate] = useState("");

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editGender, setEditGender] = useState("MALE");
  const [editDob, setEditDob] = useState("");
  const [editBloodGroup, setEditBloodGroup] = useState("O+");
  const [editAddress, setEditAddress] = useState("");
  const [editClassId, setEditClassId] = useState("");
  const [editSectionId, setEditSectionId] = useState("");
  const [editRollNumber, setEditRollNumber] = useState("");
  const [editTotalFees, setEditTotalFees] = useState("");
  const [editPaidFees, setEditPaidFees] = useState("");
  const [editFeeDueDate, setEditFeeDueDate] = useState("");

  const loadData = () => {
    fetch("/api/admin/students")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setStudents(json.data);
      })
      .finally(() => setLoading(false));

    fetch("/api/admin/academics")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setClasses(json.data.classes);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          gender,
          dob,
          bloodGroup,
          address,
          classId,
          sectionId,
          rollNumber,
          parentEmail,
          parentFirstName,
          parentLastName,
          parentPhone,
          relationship,
          totalFees: totalFees ? parseFloat(totalFees) : 0,
          paidFees: paidFees ? parseFloat(paidFees) : 0,
          feeDueDate: feeDueDate || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        // Clear fields
        setFirstName("");
        setLastName("");
        setEmail("");
        setRollNumber("");
        setParentEmail("");
        setTotalFees("4500");
        setPaidFees("0");
        setFeeDueDate("");
        loadData();
      } else {
        alert(data.error || "Admission failed");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (student: any) => {
    setEditingStudent(student);
    const enr = student.enrollments?.[0];
    setEditFirstName(student.profile?.firstName || "");
    setEditLastName(student.profile?.lastName || "");
    setEditGender(student.profile?.gender || "MALE");
    setEditDob(student.profile?.dob ? new Date(student.profile.dob).toISOString().split("T")[0] : "");
    setEditBloodGroup(student.profile?.bloodGroup || "O+");
    setEditAddress(student.profile?.address || "");
    setEditClassId(enr?.classId || "");
    setEditSectionId(enr?.sectionId || "");
    setEditRollNumber(enr?.rollNumber || "");
    setEditTotalFees(student.totalFees !== undefined ? String(student.totalFees) : "0");
    setEditPaidFees(student.paidFees !== undefined ? String(student.paidFees) : "0");
    setEditFeeDueDate(
      student.feeDueDate ? new Date(student.feeDueDate).toISOString().split("T")[0] : ""
    );
    setEditModalOpen(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setEditSubmitting(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: editingStudent.id,
          firstName: editFirstName,
          lastName: editLastName,
          gender: editGender,
          dob: editDob || null,
          bloodGroup: editBloodGroup,
          address: editAddress,
          classId: editClassId,
          sectionId: editSectionId,
          rollNumber: editRollNumber,
          totalFees: editTotalFees ? parseFloat(editTotalFees) : 0,
          paidFees: editPaidFees ? parseFloat(editPaidFees) : 0,
          feeDueDate: editFeeDueDate || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditModalOpen(false);
        setEditingStudent(null);
        loadData();
      } else {
        alert(data.error || "Update failed");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setEditSubmitting(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const fullName = `${s.profile?.firstName} ${s.profile?.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchesClass = selectedClass ? s.enrollments?.[0]?.classId === selectedClass : true;
    return matchesSearch && matchesClass;
  });

  const activeSections = classes.find((c) => c.id === classId)?.sections || [];
  const editActiveSections = classes.find((c) => c.id === editClassId)?.sections || [];

  return (
    <DashboardLayout allowedRoles={["SCHOOL_ADMIN", "SUPER_ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Directory & Admissions</h1>
            <p className="text-xs text-slate-500 mt-1">Enroll new students, map guardians, and manage class assignments</p>
          </div>
          <button
            onClick={() => {
              if (classes.length > 0) {
                setClassId(classes[0].id);
                if (classes[0].sections?.length > 0) {
                  setSectionId(classes[0].sections[0].id);
                }
              }
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Admit New Student</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500">Filter Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <p className="text-xs text-slate-500">Loading student directory...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Students Found"
              description={
                search || selectedClass
                  ? "No enrolled students matched your search or class filter."
                  : "No students enrolled yet in this institution."
              }
              action={
                search || selectedClass
                  ? {
                      label: "Clear Filters",
                      onClick: () => {
                        setSearch("");
                        setSelectedClass("");
                      },
                    }
                  : undefined
              }
            />
          ) : (
            <div className="table-responsive-container">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Student Particulars</th>
                    <th className="p-4">Roll No</th>
                    <th className="p-4">Class & Section</th>
                    <th className="p-4">Fee Overview</th>
                    <th className="p-4">Guardian / Parent</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => {
                    const enr = s.enrollments?.[0];
                    const parentRelation = s.parentRelations?.[0];
                    const total = s.totalFees || 0;
                    const paid = s.paidFees || 0;
                    const due = s.dueFees !== undefined ? s.dueFees : Math.max(0, total - paid);
                    const isOverdue = due > 0 && s.feeDueDate && new Date(s.feeDueDate) < new Date();

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">
                            {s.profile?.firstName} {s.profile?.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400">{s.email}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {s.profile?.gender || "-"} &bull; {s.profile?.bloodGroup || "-"}
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-700">{enr?.rollNumber || "N/A"}</td>
                        <td className="p-4 font-semibold text-slate-800">
                          {enr?.class?.name} - {enr?.section?.name}
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <span>{formatCurrency(total)}</span>
                              <span className="text-[10px] font-normal text-slate-400">Total</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="text-emerald-600 font-semibold">
                                Paid: {formatCurrency(paid)}
                              </span>
                              <span className={`font-bold ${due > 0 ? "text-amber-600" : "text-slate-400"}`}>
                                Due: {formatCurrency(due)}
                              </span>
                            </div>
                            {s.feeDueDate && (
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>Due: {formatDate(s.feeDueDate)}</span>
                                {isOverdue && (
                                  <Badge variant="danger" size="sm">
                                    Overdue
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {parentRelation ? (
                            <div>
                              <span className="font-semibold text-slate-800">
                                {parentRelation.parent?.profile?.firstName} {parentRelation.parent?.profile?.lastName}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                ({parentRelation.relationship}) &bull; {parentRelation.parent?.email}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">None linked</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge variant="success" dot>
                            {enr?.status || "ACTIVE"}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => openEditModal(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Admission Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">New Student Admission Form</h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdmission} className="mt-4 space-y-4 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-indigo-700">
                  1. Student Personal Details
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Liam"
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
                      placeholder="e.g. Vance"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@greenwood.edu"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-indigo-700 pt-2">
                  2. Academic Placement
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Target Class *</label>
                    <select
                      required
                      value={classId}
                      onChange={(e) => {
                        setClassId(e.target.value);
                        const c = classes.find((cl) => cl.id === e.target.value);
                        if (c?.sections?.length) setSectionId(c.sections[0].id);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
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
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      {activeSections.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Roll Number</label>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="e.g. 104"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-indigo-700 pt-2">
                  3. Fee Details & Schedule
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Total Fees ($) *</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={totalFees}
                        onChange={(e) => setTotalFees(e.target.value)}
                        placeholder="4500"
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Paid Fees ($)</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={paidFees}
                        onChange={(e) => setPaidFees(e.target.value)}
                        placeholder="0"
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Fee Due Date</label>
                    <input
                      type="date"
                      value={feeDueDate}
                      onChange={(e) => setFeeDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    />
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-indigo-700 pt-2">
                  4. Guardian / Parent Particulars
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Parent First Name</label>
                    <input
                      type="text"
                      value={parentFirstName}
                      onChange={(e) => setParentFirstName(e.target.value)}
                      placeholder="David"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Parent Last Name</label>
                    <input
                      type="text"
                      value={parentLastName}
                      onChange={(e) => setParentLastName(e.target.value)}
                      placeholder="Vance"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Parent Email</label>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="parent@gmail.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Relationship</label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="FATHER">Father</option>
                      <option value="MOTHER">Mother</option>
                      <option value="GUARDIAN">Guardian</option>
                    </select>
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
                    <span>Complete Admission</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {editModalOpen && editingStudent && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Student & Fee Details</h3>
                  <p className="text-xs text-slate-500">{editingStudent.email}</p>
                </div>
                <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateStudent} className="mt-4 space-y-4 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-indigo-700">
                  1. Personal Details
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={editDob}
                      onChange={(e) => setEditDob(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Blood Group</label>
                    <select
                      value={editBloodGroup}
                      onChange={(e) => setEditBloodGroup(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Address</label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="e.g. 12 Elm Street"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-indigo-700 pt-2">
                  2. Academic Placement
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Target Class *</label>
                    <select
                      required
                      value={editClassId}
                      onChange={(e) => {
                        setEditClassId(e.target.value);
                        const c = classes.find((cl) => cl.id === e.target.value);
                        if (c?.sections?.length) setEditSectionId(c.sections[0].id);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
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
                      value={editSectionId}
                      onChange={(e) => setEditSectionId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      {editActiveSections.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Roll Number</label>
                    <input
                      type="text"
                      value={editRollNumber}
                      onChange={(e) => setEditRollNumber(e.target.value)}
                      placeholder="e.g. 104"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-indigo-700 pt-2">
                  3. Student Fee Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Total Fees ($) *</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editTotalFees}
                        onChange={(e) => setEditTotalFees(e.target.value)}
                        placeholder="4500"
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Paid Fees ($)</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editPaidFees}
                        onChange={(e) => setEditPaidFees(e.target.value)}
                        placeholder="0"
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Fee Due Date</label>
                    <input
                      type="date"
                      value={editFeeDueDate}
                      onChange={(e) => setEditFeeDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg"
                  >
                    {editSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                    <span>Save Changes</span>
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
