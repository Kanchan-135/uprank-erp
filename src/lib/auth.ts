import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { prisma } from "./prisma";
import { AuthUser, UserRole } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "school-erp-super-secure-production-secret-key-2025";
const COOKIE_NAME = "school_erp_token";

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  schoolId?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    let token = cookies().get(COOKIE_NAME)?.value;

    if (!token) {
      const authHeader = headers().get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }
    }

    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        profile: true,
        school: true,
      },
    });

    if (!user || user.status !== "ACTIVE") return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      schoolId: user.schoolId,
      schoolName: user.school?.name || null,
      firstName: user.profile?.firstName || "User",
      lastName: user.profile?.lastName || "",
      avatar: user.avatar,
      phone: user.profile?.phone || null,
    };
  } catch (error) {
    return null;
  }
}

export function getAuthCookieName(): string {
  return COOKIE_NAME;
}
