import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { getServerAuthContext } from "@/lib/server-auth";

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const auth = await getServerAuthContext();
  if (!auth) {
    redirect("/login");
  }
  return <DashboardShell>{children}</DashboardShell>;
}
