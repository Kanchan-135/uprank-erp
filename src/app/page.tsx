import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function Home() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  switch (user.role) {
    case "SUPER_ADMIN":
      redirect("/super-admin/dashboard");
    case "SCHOOL_ADMIN":
      redirect("/admin/dashboard");
    case "TEACHER":
      redirect("/teacher/dashboard");
    case "STUDENT":
      redirect("/student/dashboard");
    case "PARENT":
      redirect("/parent/dashboard");
    default:
      redirect("/login");
  }
}
