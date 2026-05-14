"use client";

import * as React from "react";

import { NavMain } from "@/components/elements/sidebar-stuff/nav-main";
import { NavSecondary } from "@/components/elements/sidebar-stuff/nav-secondary";
import { NavUser } from "@/components/elements/sidebar-stuff/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  ListIcon,
  ChartBarIcon,
  FolderIcon,
  BadgeCentIcon,
  Settings2Icon,
} from "lucide-react";
import { Skeleton } from "../../ui/skeleton";
import { Suspense } from "react";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/app/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Transactions",
      url: "/app/transactions",
      icon: <ListIcon />,
    },
    {
      title: "Categories",
      url: "/app/categories",
      icon: <ChartBarIcon />,
    },
    {
      title: "Budget",
      url: "/app/budget",
      icon: <FolderIcon />,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/app/settings",
      icon: <Settings2Icon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/app/dashboard">
                <BadgeCentIcon className="size-5! text-primary" />
                <span className="text-base font-semibold">Cashly</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <Suspense fallback={<Skeleton className="w-full h-10 rounded-md" />}>
          <NavUser />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}
