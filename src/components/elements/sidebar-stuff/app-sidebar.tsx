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
  WalletIcon,
  RefreshCwIcon,
  TrendingUpIcon,
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
      icon: <LayoutDashboardIcon className="size-4" />,
      description: "Overview & analytics",
    },
    {
      title: "Transactions",
      url: "/app/transactions",
      icon: <WalletIcon className="size-4" />,
      description: "View all transactions",
    },
    {
      title: "Subscriptions",
      url: "/app/subscriptions",
      icon: <RefreshCwIcon className="size-4" />,
      description: "Manage subscriptions",
    },
    {
      title: "Budget",
      url: "/app/budget",
      icon: <TrendingUpIcon className="size-4" />,
      description: "Budget planning",
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/app/settings",
      icon: <Settings2Icon className="size-4" />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b bg-linear-to-b from-sidebar to-sidebar/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-11 px-4 transition-all duration-200 hover:bg-sidebar-accent active:bg-sidebar-accent/80"
            >
              <a href="/app/dashboard" className="gap-2.5">
                <div className="flex items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/80 p-1.5">
                  <BadgeCentIcon className="size-5 text-primary-foreground" />
                </div>
                <div className="flex flex-col gap-0.5 leading-tight">
                  <span className="font-bold tracking-tight">Cashly</span>
                  <span className="text-xs text-muted-foreground font-medium">
                    Finance tracker
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="border-t">
        <Suspense fallback={<Skeleton className="w-full h-12 rounded-lg" />}>
          <NavUser />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}
