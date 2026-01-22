// lib/authGuard.js
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export function requireRole(role) {
  const userRole = cookies().get("role")?.value;
  if (userRole !== role) redirect("/auth/login");
}
