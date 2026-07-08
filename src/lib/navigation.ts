import { BookOpen01Icon } from "@hugeicons/core-free-icons";
import { DashboardSquare01Icon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export interface NavItem {
  title: string;
  href: string;
  icon: IconSvgElement;
}

export const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: DashboardSquare01Icon,
  },
  {
    title: "Topics",
    href: "/topics",
    icon: BookOpen01Icon,
  },
];
