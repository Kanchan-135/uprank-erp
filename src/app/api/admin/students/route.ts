import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hashPassword } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SCHOOL_ADMIN" && user.role !== "SUPER_ADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const sectionId = searchParams.get("sectionId");
    const search = searchParams.get("search");

    const schoolId = user.schoolId || (await prisma.school.findFirst())?.id;
    if (!schoolId) {
      return NextResponse.json({ success: false, error: "No school found" }, { status: 400 });
    }

    const whereClause: any = {
      schoolId,
      role: "STUDENT",
    };

    if (search) {
      whereClause.OR = [
        { email: { contains: search } },
        { profile: { firstName: { contains: search } } },
        { profile: { lastName: { contains: search } } },
      ];
    }

    if (classId || sectionId) {
      whereClause.enrollments = {
        some: {
          ...(classId ? { classId } : {}),
          ...(sectionId ? { sectionId } : {}),
          status: "ENROLLED",
        },
      };
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      include: {
        profile: true,
        enrollments: {
          where: { status: "ENROLLED" },
          include: { class: true, section: true, academicYear: true },
        },
        parentRelations: {
          include: {
            parent: {
              include: { profile: true },
            },
          },
        },
        feeInvoices: {
          select: {
            id: true,
            title: true,
            amount: true,
            paidAmount: true,
            dueDate: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = students.map((s) => {
      const totalFees = s.feeInvoices.reduce((acc: number, inv: any) => acc + inv.amount, 0);
      const paidFees = s.feeInvoices.reduce((acc: number, inv: any) => acc + inv.paidAmount, 0);
      const dueFees = Math.max(0, totalFees - paidFees);
      const pendingInvoices = s.feeInvoices.filter((inv: any) => inv.status !== "PAID");
      const sortedInvoices = (pendingInvoices.length > 0 ? pendingInvoices : s.feeInvoices).sort(
        (a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
      const feeDueDate = sortedInvoices[0]?.dueDate || null;

      return {
        ...s,
        totalFees,
        paidFees,
        dueFees,
        feeDueDate,
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SCHOOL_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
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
      totalFees,
      feeDueDate,
      paidFees,
    } = body;

    if (!firstName || !lastName || !email || !classId || !sectionId) {
      return NextResponse.json({ success: false, error: "Missing required student admission fields" }, { status: 400 });
    }

    const existingStudent = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingStudent) {
      return NextResponse.json({ success: false, error: "Student email is already registered" }, { status: 400 });
    }

    const currentYear = await prisma.academicYear.findFirst({
      where: { schoolId: user.schoolId!, isCurrent: true },
    });
    if (!currentYear) {
      return NextResponse.json({ success: false, error: "Active academic year not configured" }, { status: 400 });
    }

    const defaultPassword = await hashPassword("password123");

    // 1. Create Student
    const student = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash: defaultPassword,
        role: "STUDENT",
        schoolId: user.schoolId!,
        profile: {
          create: {
            firstName,
            lastName,
            gender,
            dob: dob ? new Date(dob) : null,
            bloodGroup,
            address,
          },
        },
        enrollments: {
          create: {
            classId,
            sectionId,
            academicYearId: currentYear.id,
            rollNumber: rollNumber || `R-${Math.floor(100 + Math.random() * 900)}`,
            status: "ENROLLED",
          },
        },
      },
    });

    // 2. Link or create Parent if provided
    if (parentEmail) {
      let parent = await prisma.user.findUnique({
        where: { email: parentEmail.toLowerCase().trim() },
      });

      if (!parent) {
        parent = await prisma.user.create({
          data: {
            email: parentEmail.toLowerCase().trim(),
            passwordHash: defaultPassword,
            role: "PARENT",
            schoolId: user.schoolId!,
            profile: {
              create: {
                firstName: parentFirstName || "Parent",
                lastName: parentLastName || lastName,
                phone: parentPhone,
                address,
              },
            },
          },
        });
      }

      await prisma.parentStudent.create({
        data: {
          parentId: parent.id,
          studentId: student.id,
          relationship: relationship || "GUARDIAN",
        },
      });
    }

    // 3. Create Student Fee Invoice if Total Fees provided
    if (totalFees && parseFloat(totalFees) > 0) {
      const feeAmount = parseFloat(totalFees);
      const paid = parseFloat(paidFees) || 0;
      const status = paid >= feeAmount ? "PAID" : paid > 0 ? "PARTIAL" : "PENDING";
      const dueDateObj = feeDueDate ? new Date(feeDueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await prisma.feeInvoice.create({
        data: {
          schoolId: user.schoolId!,
          studentId: student.id,
          academicYearId: currentYear.id,
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
          title: "Academic Session & Tuition Fee",
          amount: feeAmount,
          paidAmount: paid,
          dueDate: dueDateObj,
          status,
        },
      });
    }

    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error: any) {
    console.error("Student admission error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SCHOOL_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      studentId,
      firstName,
      lastName,
      gender,
      dob,
      bloodGroup,
      address,
      classId,
      sectionId,
      rollNumber,
      totalFees,
      paidFees,
      feeDueDate,
    } = body;

    if (!studentId) {
      return NextResponse.json({ success: false, error: "Student ID is required" }, { status: 400 });
    }

    // Update profile
    await prisma.profile.update({
      where: { userId: studentId },
      data: {
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(gender ? { gender } : {}),
        ...(dob ? { dob: new Date(dob) } : {}),
        ...(bloodGroup ? { bloodGroup } : {}),
        ...(address !== undefined ? { address } : {}),
      },
    });

    // Update enrollment
    if (classId || sectionId || rollNumber) {
      const currentEnrollment = await prisma.studentEnrollment.findFirst({
        where: { studentId, status: "ENROLLED" },
      });
      if (currentEnrollment) {
        await prisma.studentEnrollment.update({
          where: { id: currentEnrollment.id },
          data: {
            ...(classId ? { classId } : {}),
            ...(sectionId ? { sectionId } : {}),
            ...(rollNumber ? { rollNumber } : {}),
          },
        });
      }
    }

    // Update or create fee invoice
    if (totalFees !== undefined && totalFees !== null && totalFees !== "") {
      const feeAmount = parseFloat(totalFees);
      const paid = parseFloat(paidFees) || 0;
      const existingInvoice = await prisma.feeInvoice.findFirst({
        where: { studentId },
        orderBy: { createdAt: "desc" },
      });

      const status = paid >= feeAmount ? "PAID" : paid > 0 ? "PARTIAL" : "PENDING";
      const dueDateObj = feeDueDate ? new Date(feeDueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      if (existingInvoice) {
        await prisma.feeInvoice.update({
          where: { id: existingInvoice.id },
          data: {
            amount: feeAmount,
            paidAmount: paid,
            dueDate: dueDateObj,
            status,
          },
        });
      } else {
        const currentYear = await prisma.academicYear.findFirst({
          where: { schoolId: user.schoolId!, isCurrent: true },
        });
        if (currentYear) {
          await prisma.feeInvoice.create({
            data: {
              schoolId: user.schoolId!,
              studentId,
              academicYearId: currentYear.id,
              invoiceNumber: `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
              title: "Academic Session & Tuition Fee",
              amount: feeAmount,
              paidAmount: paid,
              dueDate: dueDateObj,
              status,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Student and fee details updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
