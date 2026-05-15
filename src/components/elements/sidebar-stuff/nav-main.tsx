"use client";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CirclePlusIcon } from "lucide-react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
    description?: string;
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Main
      </SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              className="w-full bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90 active:bg-primary/80"
            >
              <a href="/app/dashboard" className="flex items-center gap-2">
                <CirclePlusIcon className="size-4" />
                <span>Quick Create</span>
              </a>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu className="gap-1">
          {items.map((item) => (
            <a href={item.url} key={item.title} className="block">
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={item.description || item.title}
                  className="group transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <div className="flex items-center gap-1 text-muted-foreground transition-colors group-hover:text-foreground">
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </a>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
