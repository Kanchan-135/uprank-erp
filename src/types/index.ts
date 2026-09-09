export type UserRole =
  | "SUPER_ADMIN"
  | "SCHOOL_ADMIN"
  | "TEACHER"
  | "STUDENT"
  | "PARENT";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  schoolId?: string | null;
  schoolName?: string | null;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  phone?: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface DashboardMetric {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: string;
  color: string;
}

export interface StudentWithEnrollment {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string | null;
    gender?: string | null;
    dob?: string | null;
    bloodGroup?: string | null;
    address?: string | null;
    emergencyContact?: string | null;
  };
  enrollment?: {
    rollNumber: string;
    class: { id: string; name: string };
    section: { id: string; name: string };
    academicYear: { id: string; name: string };
    status: string;
  } | null;
  parents?: Array<{
    relationship: string;
    parent: {
      id: string;
      email: string;
      profile: {
        firstName: string;
        lastName: string;
        phone?: string | null;
      };
    };
  }>;
}

export interface TeacherItem {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string | null;
    designation?: string | null;
    qualification?: string | null;
  };
  assignments?: Array<{
    id: string;
    class: { id: string; name: string };
    section: { id: string; name: string };
    subject: { id: string; name: string; code: string };
  }>;
}

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  remarks?: string;
}
