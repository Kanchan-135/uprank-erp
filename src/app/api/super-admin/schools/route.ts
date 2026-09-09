import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const schools = await prisma.school.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { users: true, classes: true, feeInvoices: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: schools });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, slug, address, phone, email, subscriptionPlan, adminEmail, adminFirstName, adminLastName } = body;

    if (!name || !code || !slug || !adminEmail) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.school.findFirst({
      where: { OR: [{ slug }, { code }] },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: "School slug or code already exists" }, { status: 400 });
    }

    const school = await prisma.school.create({
      data: {
        name,
        code,
        slug,
        address,
        phone,
        email,
        subscriptionPlan: subscriptionPlan || "PRO",
        status: "ACTIVE",
      },
    });

    // Create Initial School Admin
    const defaultPassword = await hashPassword("password123");
    await prisma.user.create({
      data: {
        email: adminEmail.toLowerCase().trim(),
        passwordHash: defaultPassword,
        role: "SCHOOL_ADMIN",
        schoolId: school.id,
        profile: {
          create: {
            firstName: adminFirstName || "School",
            lastName: adminLastName || "Administrator",
            phone: phone || "",
            designation: "Principal / Administrator",
          },
        },
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        schoolId: school.id,
        userId: user.id,
        action: "TENANT_ONBOARDED",
        entityType: "SCHOOL",
        entityId: school.id,
        details: `Created new school: ${name} (${code}) with admin ${adminEmail}`,
      },
    });

    return NextResponse.json({ success: true, data: school }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
