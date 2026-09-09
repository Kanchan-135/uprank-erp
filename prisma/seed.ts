import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing records in correct relation order
  await prisma.auditLog.deleteMany();
  await prisma.feePayment.deleteMany();
  await prisma.feeInvoice.deleteMany();
  await prisma.feeStructure.deleteMany();
  await prisma.feeCategory.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.examSubject.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.teacherAssignment.deleteMany();
  await prisma.parentStudent.deleteMany();
  await prisma.studentEnrollment.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.section.deleteMany();
  await prisma.class.deleteMany();
  await prisma.term.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();

  const defaultPasswordHash = await bcrypt.hash("password123", 10);

  // 1. Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@uprank.edu",
      passwordHash: defaultPasswordHash,
      role: "SUPER_ADMIN",
      profile: {
        create: {
          firstName: "Arthur",
          lastName: "Pendleton",
          phone: "+1 (555) 019-9000",
          designation: "Chief Platform Architect",
        },
      },
    },
  });

  // Legacy alias for compatibility
  await prisma.user.create({
    data: {
      email: "superadmin@erp.com",
      passwordHash: defaultPasswordHash,
      role: "SUPER_ADMIN",
      profile: {
        create: {
          firstName: "Arthur",
          lastName: "Pendleton",
          phone: "+1 (555) 019-9000",
          designation: "Chief Platform Architect",
        },
      },
    },
  });

  // 2. Primary School: Greenwood International Academy
  const greenwoodSchool = await prisma.school.create({
    data: {
      name: "Greenwood International Academy",
      slug: "greenwood",
      code: "GIA-2025",
      logo: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=128&auto=format&fit=crop&q=80",
      address: "742 Evergreen Terrace, Springfield, OR 97477",
      phone: "+1 (555) 321-4567",
      email: "contact@greenwood.edu",
      website: "https://greenwood.edu",
      subscriptionPlan: "ENTERPRISE",
      subscriptionStatus: "ACTIVE",
      subscriptionStartDate: new Date("2024-01-01"),
      subscriptionExpiryDate: new Date("2025-12-31"),
      renewalPrice: 999,
      billingCycle: "ANNUAL",
      autoRenew: true,
      status: "ACTIVE",
    },
  });

  // Secondary School for Multi-Tenant Demonstration
  const apexSchool = await prisma.school.create({
    data: {
      name: "Apex STEM Academy",
      slug: "apex-stem",
      code: "ASA-2025",
      address: "100 Science Boulevard, Silicon Valley, CA 94025",
      phone: "+1 (555) 987-6543",
      email: "admissions@apexstem.edu",
      subscriptionPlan: "PRO",
      subscriptionStatus: "ACTIVE",
      subscriptionStartDate: new Date("2024-06-01"),
      subscriptionExpiryDate: new Date("2025-06-01"),
      renewalPrice: 499,
      billingCycle: "ANNUAL",
      autoRenew: true,
      status: "ACTIVE",
    },
  });

  // School Admin for Greenwood
  const schoolAdmin = await prisma.user.create({
    data: {
      email: "admin@greenwood.edu",
      passwordHash: defaultPasswordHash,
      role: "SCHOOL_ADMIN",
      schoolId: greenwoodSchool.id,
      profile: {
        create: {
          firstName: "Dr. Jonathan",
          lastName: "Vance",
          phone: "+1 (555) 321-4501",
          designation: "Executive Principal",
          qualification: "Ph.D. in Educational Leadership",
        },
      },
    },
  });

  // Academic Year & Terms
  const academicYear = await prisma.academicYear.create({
    data: {
      schoolId: greenwoodSchool.id,
      name: "2024-2025",
      startDate: new Date("2024-09-01"),
      endDate: new Date("2025-06-30"),
      isCurrent: true,
    },
  });

  const term1 = await prisma.term.create({
    data: {
      academicYearId: academicYear.id,
      name: "Fall Term (Term 1)",
      startDate: new Date("2024-09-01"),
      endDate: new Date("2024-12-20"),
      isCurrent: false,
    },
  });

  const term2 = await prisma.term.create({
    data: {
      academicYearId: academicYear.id,
      name: "Spring Term (Term 2)",
      startDate: new Date("2025-01-08"),
      endDate: new Date("2025-06-25"),
      isCurrent: true,
    },
  });

  // Classes & Sections
  const class10 = await prisma.class.create({
    data: {
      schoolId: greenwoodSchool.id,
      name: "Grade 10",
      code: "G10",
      capacity: 40,
    },
  });

  const class9 = await prisma.class.create({
    data: {
      schoolId: greenwoodSchool.id,
      name: "Grade 9",
      code: "G9",
      capacity: 40,
    },
  });

  const section10A = await prisma.section.create({
    data: {
      classId: class10.id,
      name: "Section A",
      capacity: 35,
    },
  });

  const section9A = await prisma.section.create({
    data: {
      classId: class9.id,
      name: "Section A",
      capacity: 35,
    },
  });

  // Subjects
  const mathSubject = await prisma.subject.create({
    data: {
      schoolId: greenwoodSchool.id,
      classId: class10.id,
      name: "Advanced Mathematics",
      code: "MATH-10",
      type: "CORE",
    },
  });

  const physicsSubject = await prisma.subject.create({
    data: {
      schoolId: greenwoodSchool.id,
      classId: class10.id,
      name: "Physics & Mechanics",
      code: "PHYS-10",
      type: "CORE",
    },
  });

  const englishSubject = await prisma.subject.create({
    data: {
      schoolId: greenwoodSchool.id,
      classId: class10.id,
      name: "English Literature",
      code: "ENG-10",
      type: "CORE",
    },
  });

  const csSubject = await prisma.subject.create({
    data: {
      schoolId: greenwoodSchool.id,
      classId: class10.id,
      name: "Computer Science & Python",
      code: "CS-10",
      type: "ELECTIVE",
    },
  });

  // Teachers
  const teacherSarah = await prisma.user.create({
    data: {
      email: "sarah.jenkins@greenwood.edu",
      passwordHash: defaultPasswordHash,
      role: "TEACHER",
      schoolId: greenwoodSchool.id,
      primaryClassId: class10.id,
      primarySectionId: section10A.id,
      profile: {
        create: {
          firstName: "Sarah",
          lastName: "Jenkins",
          phone: "+1 (555) 789-1001",
          designation: "Senior Mathematics Faculty & Class Teacher",
          qualification: "M.Sc. Applied Mathematics, B.Ed.",
          gender: "FEMALE",
        },
      },
    },
  });

  const teacherMarcus = await prisma.user.create({
    data: {
      email: "marcus.reed@greenwood.edu",
      passwordHash: defaultPasswordHash,
      role: "TEACHER",
      schoolId: greenwoodSchool.id,
      primaryClassId: class9.id,
      primarySectionId: section9A.id,
      profile: {
        create: {
          firstName: "Marcus",
          lastName: "Reed",
          phone: "+1 (555) 789-1002",
          designation: "Head of Computer Science & Robotics",
          qualification: "B.Tech Computer Science",
          gender: "MALE",
        },
      },
    },
  });

  // Teacher Assignments
  await prisma.teacherAssignment.create({
    data: {
      teacherId: teacherSarah.id,
      subjectId: mathSubject.id,
      classId: class10.id,
      sectionId: section10A.id,
      academicYearId: academicYear.id,
    },
  });

  await prisma.teacherAssignment.create({
    data: {
      teacherId: teacherSarah.id,
      subjectId: physicsSubject.id,
      classId: class10.id,
      sectionId: section10A.id,
      academicYearId: academicYear.id,
    },
  });

  await prisma.teacherAssignment.create({
    data: {
      teacherId: teacherMarcus.id,
      subjectId: csSubject.id,
      classId: class10.id,
      sectionId: section10A.id,
      academicYearId: academicYear.id,
    },
  });

  // Timetable
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const periods = [
    { start: "08:30", end: "09:20", subject: mathSubject, teacher: teacherSarah, room: "Lab 101" },
    { start: "09:25", end: "10:15", subject: physicsSubject, teacher: teacherSarah, room: "Science Wing 2" },
    { start: "10:30", end: "11:20", subject: csSubject, teacher: teacherMarcus, room: "Computer Lab A" },
    { start: "11:25", end: "12:15", subject: englishSubject, teacher: teacherSarah, room: "Room 204" },
  ];

  for (const day of days) {
    for (const p of periods) {
      await prisma.timetableSlot.create({
        data: {
          classId: class10.id,
          sectionId: section10A.id,
          subjectId: p.subject.id,
          teacherId: p.teacher.id,
          dayOfWeek: day,
          startTime: p.start,
          endTime: p.end,
          roomNumber: p.room,
        },
      });
    }
  }

  // Students
  const studentAlex = await prisma.user.create({
    data: {
      email: "alex.morgan@greenwood.edu",
      passwordHash: defaultPasswordHash,
      role: "STUDENT",
      schoolId: greenwoodSchool.id,
      profile: {
        create: {
          firstName: "Alex",
          lastName: "Morgan",
          gender: "MALE",
          dob: new Date("2009-04-14"),
          bloodGroup: "O+",
          address: "142 Elm Street, Springfield",
          emergencyContact: "+1 (555) 444-9001",
        },
      },
    },
  });

  const studentEmily = await prisma.user.create({
    data: {
      email: "emily.morgan@greenwood.edu",
      passwordHash: defaultPasswordHash,
      role: "STUDENT",
      schoolId: greenwoodSchool.id,
      profile: {
        create: {
          firstName: "Emily",
          lastName: "Morgan",
          gender: "FEMALE",
          dob: new Date("2010-09-22"),
          bloodGroup: "A+",
          address: "142 Elm Street, Springfield",
          emergencyContact: "+1 (555) 444-9001",
        },
      },
    },
  });

  const studentLiam = await prisma.user.create({
    data: {
      email: "liam.chen@greenwood.edu",
      passwordHash: defaultPasswordHash,
      role: "STUDENT",
      schoolId: greenwoodSchool.id,
      profile: {
        create: {
          firstName: "Liam",
          lastName: "Chen",
          gender: "MALE",
          dob: new Date("2009-06-18"),
          bloodGroup: "B+",
          address: "88 Willow Creek Lane, Springfield",
        },
      },
    },
  });

  const studentSophia = await prisma.user.create({
    data: {
      email: "sophia.patel@greenwood.edu",
      passwordHash: defaultPasswordHash,
      role: "STUDENT",
      schoolId: greenwoodSchool.id,
      profile: {
        create: {
          firstName: "Sophia",
          lastName: "Patel",
          gender: "FEMALE",
          dob: new Date("2009-11-05"),
          bloodGroup: "AB+",
          address: "33 Magnolia Court, Springfield",
        },
      },
    },
  });

  // Enrollments
  await prisma.studentEnrollment.create({
    data: {
      studentId: studentAlex.id,
      classId: class10.id,
      sectionId: section10A.id,
      academicYearId: academicYear.id,
      rollNumber: "101",
      status: "ENROLLED",
    },
  });

  await prisma.studentEnrollment.create({
    data: {
      studentId: studentEmily.id,
      classId: class9.id,
      sectionId: section9A.id,
      academicYearId: academicYear.id,
      rollNumber: "204",
      status: "ENROLLED",
    },
  });

  await prisma.studentEnrollment.create({
    data: {
      studentId: studentLiam.id,
      classId: class10.id,
      sectionId: section10A.id,
      academicYearId: academicYear.id,
      rollNumber: "102",
      status: "ENROLLED",
    },
  });

  await prisma.studentEnrollment.create({
    data: {
      studentId: studentSophia.id,
      classId: class10.id,
      sectionId: section10A.id,
      academicYearId: academicYear.id,
      rollNumber: "103",
      status: "ENROLLED",
    },
  });

  // Parent
  const parentRobert = await prisma.user.create({
    data: {
      email: "robert.morgan@greenwood.edu",
      passwordHash: defaultPasswordHash,
      role: "PARENT",
      schoolId: greenwoodSchool.id,
      profile: {
        create: {
          firstName: "Robert",
          lastName: "Morgan",
          phone: "+1 (555) 444-9001",
          gender: "MALE",
          address: "142 Elm Street, Springfield",
          designation: "Senior Software Architect",
        },
      },
    },
  });

  // Link Robert to Alex (Grade 10) and Emily (Grade 9)
  await prisma.parentStudent.create({
    data: {
      parentId: parentRobert.id,
      studentId: studentAlex.id,
      relationship: "FATHER",
    },
  });

  await prisma.parentStudent.create({
    data: {
      parentId: parentRobert.id,
      studentId: studentEmily.id,
      relationship: "FATHER",
    },
  });

  // Attendance Records for the last 15 school days
  const today = new Date();
  const studentsGrade10 = [studentAlex, studentLiam, studentSophia];
  
  for (let i = 1; i <= 15; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    for (const st of studentsGrade10) {
      // Alex has high attendance, occasional late
      let status = "PRESENT";
      if (st.id === studentAlex.id && i === 3) status = "LATE";
      if (st.id === studentLiam.id && i === 5) status = "ABSENT";
      if (st.id === studentSophia.id && i === 8) status = "EXCUSED";

      await prisma.attendance.create({
        data: {
          studentId: st.id,
          classId: class10.id,
          sectionId: section10A.id,
          date: d,
          status: status,
          markedById: teacherSarah.id,
          remarks: status === "LATE" ? "Traffic delay" : null,
        },
      });
    }

    // Emily (Grade 9)
    await prisma.attendance.create({
      data: {
        studentId: studentEmily.id,
        classId: class9.id,
        sectionId: section9A.id,
        date: d,
        status: i === 4 ? "ABSENT" : "PRESENT",
        remarks: i === 4 ? "Mild fever" : null,
      },
    });
  }

  // Examination & Results
  const midTermExam = await prisma.exam.create({
    data: {
      termId: term1.id,
      name: "Mid-Term Examination 2024",
      startDate: new Date("2024-10-15"),
      endDate: new Date("2024-10-25"),
      status: "PUBLISHED",
    },
  });

  const examMath = await prisma.examSubject.create({
    data: {
      examId: midTermExam.id,
      subjectId: mathSubject.id,
      maxMarks: 100,
      passMarks: 40,
      examDate: new Date("2024-10-16"),
    },
  });

  const examPhysics = await prisma.examSubject.create({
    data: {
      examId: midTermExam.id,
      subjectId: physicsSubject.id,
      maxMarks: 100,
      passMarks: 40,
      examDate: new Date("2024-10-18"),
    },
  });

  const examCS = await prisma.examSubject.create({
    data: {
      examId: midTermExam.id,
      subjectId: csSubject.id,
      maxMarks: 100,
      passMarks: 40,
      examDate: new Date("2024-10-22"),
    },
  });

  // Scores for Alex Morgan
  await prisma.examResult.create({
    data: {
      examSubjectId: examMath.id,
      studentId: studentAlex.id,
      marksObtained: 94,
      grade: "A+",
      remarks: "Outstanding problem solving and algebraic proofs.",
    },
  });

  await prisma.examResult.create({
    data: {
      examSubjectId: examPhysics.id,
      studentId: studentAlex.id,
      marksObtained: 88,
      grade: "A",
      remarks: "Strong grasp of Newtonian kinematics.",
    },
  });

  await prisma.examResult.create({
    data: {
      examSubjectId: examCS.id,
      studentId: studentAlex.id,
      marksObtained: 96,
      grade: "A+",
      remarks: "Exceptional algorithmic design and clean Python syntax.",
    },
  });

  // Scores for Liam Chen
  await prisma.examResult.create({
    data: {
      examSubjectId: examMath.id,
      studentId: studentLiam.id,
      marksObtained: 82,
      grade: "A",
      remarks: "Consistent work and thorough calculations.",
    },
  });

  // Fee Categories & Structures
  const tuitionCategory = await prisma.feeCategory.create({
    data: {
      schoolId: greenwoodSchool.id,
      name: "Quarterly Academic Tuition",
      description: "Standard instructional & classroom facilities fee",
    },
  });

  const labCategory = await prisma.feeCategory.create({
    data: {
      schoolId: greenwoodSchool.id,
      name: "STEM & Science Lab Fee",
      description: "Hands-on robotics, chemistry & physics laboratory materials",
    },
  });

  const feeStruct1 = await prisma.feeStructure.create({
    data: {
      schoolId: greenwoodSchool.id,
      classId: class10.id,
      feeCategoryId: tuitionCategory.id,
      amount: 1450.0,
      frequency: "QUARTERLY",
    },
  });

  const feeStruct2 = await prisma.feeStructure.create({
    data: {
      schoolId: greenwoodSchool.id,
      classId: class10.id,
      feeCategoryId: labCategory.id,
      amount: 250.0,
      frequency: "QUARTERLY",
    },
  });

  // Invoices for Alex Morgan
  const paidInvoice = await prisma.feeInvoice.create({
    data: {
      schoolId: greenwoodSchool.id,
      studentId: studentAlex.id,
      academicYearId: academicYear.id,
      feeStructureId: feeStruct1.id,
      invoiceNumber: "INV-2024-Q1-101",
      title: "Term 1 Tuition Fee (Fall 2024)",
      amount: 1450.0,
      paidAmount: 1450.0,
      dueDate: new Date("2024-09-15"),
      status: "PAID",
    },
  });

  await prisma.feePayment.create({
    data: {
      feeInvoiceId: paidInvoice.id,
      amount: 1450.0,
      paymentMethod: "ONLINE",
      transactionId: "TXN_GW_98124018",
      receiptNumber: "REC-2024-0081",
      paidAt: new Date("2024-09-10"),
      status: "SUCCESS",
    },
  });

  // Pending Invoice for Alex Morgan
  await prisma.feeInvoice.create({
    data: {
      schoolId: greenwoodSchool.id,
      studentId: studentAlex.id,
      academicYearId: academicYear.id,
      feeStructureId: feeStruct2.id,
      invoiceNumber: "INV-2025-Q2-101",
      title: "Term 2 STEM Lab & Equipment Fee",
      amount: 250.0,
      paidAmount: 0.0,
      dueDate: new Date("2025-02-28"),
      status: "PENDING",
    },
  });

  // Assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      teacherId: teacherSarah.id,
      classId: class10.id,
      sectionId: section10A.id,
      subjectId: mathSubject.id,
      title: "Quadratic Equations and Optimization Problems",
      description: "Solve problems 1-15 from Chapter 4. Show complete mathematical derivations and graph parabolas.",
      dueDate: new Date("2025-03-15"),
      maxScore: 50,
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      teacherId: teacherMarcus.id,
      classId: class10.id,
      sectionId: section10A.id,
      subjectId: csSubject.id,
      title: "Python Data Structures: Student Grade Analyzer",
      description: "Implement a script utilizing dictionaries and lists to calculate median, mean, and letter grades.",
      dueDate: new Date("2025-03-20"),
      maxScore: 100,
    },
  });

  // Submissions
  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: studentAlex.id,
      content: "Completed all 15 exercises with plotted vertex points and quadratic curves.",
      submittedAt: new Date(),
      score: 48,
      feedback: "Great presentation. Very neat step-by-step proofs!",
      status: "GRADED",
    },
  });

  // Notices
  await prisma.notice.create({
    data: {
      schoolId: greenwoodSchool.id,
      authorId: schoolAdmin.id,
      title: "Annual STEM & Science Innovation Fair 2025",
      content: "All Grade 9 and 10 students are invited to submit their science project abstracts before March 30. Parents and mentors are welcome on presentation day.",
      targetRole: "ALL",
      isUrgent: false,
      publishDate: new Date(),
    },
  });

  await prisma.notice.create({
    data: {
      schoolId: greenwoodSchool.id,
      authorId: schoolAdmin.id,
      title: "Parent-Teacher Conference Schedule (Spring Term)",
      content: "Parent-Teacher meetings will be held virtually and on-campus next Friday from 2:00 PM to 6:00 PM. Book time slots via the parent portal.",
      targetRole: "PARENTS",
      isUrgent: true,
      publishDate: new Date(),
    },
  });

  // Leave Request
  await prisma.leaveRequest.create({
    data: {
      requesterId: parentRobert.id,
      studentId: studentAlex.id,
      startDate: new Date("2025-03-25"),
      endDate: new Date("2025-03-26"),
      reason: "Family travel for national chess championship.",
      status: "APPROVED",
      reviewedById: schoolAdmin.id,
      reviewNote: "Approved. Please ensure makeup assignments are submitted by next Monday.",
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      schoolId: greenwoodSchool.id,
      userId: schoolAdmin.id,
      action: "ACADEMIC_YEAR_CONFIGURED",
      details: "Academic calendar 2024-2025 initialized with 2 terms.",
      ipAddress: "127.0.0.1",
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("-----------------------------------------");
  console.log("Demo Credentials (all use 'password123'):");
  console.log("1. Super Admin:  superadmin@erp.com");
  console.log("2. School Admin: admin@greenwood.edu");
  console.log("3. Teacher:      sarah.jenkins@greenwood.edu");
  console.log("4. Student:      alex.morgan@greenwood.edu");
  console.log("5. Parent:       robert.morgan@greenwood.edu");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
