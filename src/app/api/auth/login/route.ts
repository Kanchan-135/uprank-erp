import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken, getAuthCookieName } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        profile: true,
        school: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "Account has been suspended or deactivated" },
        { status: 403 }
      );
    }

    // Log login in audit
    await prisma.auditLog.create({
      data: {
        schoolId: user.schoolId,
        userId: user.id,
        action: "USER_LOGIN",
        details: `Successful login by ${user.email} (${user.role})`,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      schoolId: user.schoolId,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        token,
        id: user.id,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        schoolName: user.school?.name,
        firstName: user.profile?.firstName || "User",
        lastName: user.profile?.lastName || "",
        avatar: user.avatar,
      },
    });

    response.cookies.set({
      name: getAuthCookieName(),
      value: token,
      httpOnly: true,
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
