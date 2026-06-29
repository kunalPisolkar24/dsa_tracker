"use client";

import type { ReactNode } from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { mainNavItems } from "@/lib/navigation";

interface DashboardShellProps {
  children: ReactNode;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} navItems={mainNavItems} />
      <main className="flex min-h-svh flex-1 flex-col">
        <SidebarTrigger className="ml-2 mt-2 md:hidden" />
        {children}
      </main>
    </SidebarProvider>
  );
}
