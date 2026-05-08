"use client";
import { AppSidebar } from "@/components/elements/app-sidebar";
import { ChartAreaInteractive } from "@/components/elements/chart-area-interactive";
import { SectionCards } from "@/components/elements/section-cards";
import { SiteHeader } from "@/components/elements/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import data from "./data.json";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";

export default function Page() {
  const [dateRange, setDateRange] = useState<{
    fromDate?: Date;
    toDate?: Date;
  }>({});

  const handleDateRangeChange = (fromDate?: Date, toDate?: Date) => {
    setDateRange({ fromDate, toDate });
  };

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards
              fromDate={dateRange.fromDate}
              toDate={dateRange.toDate}
            />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive onDateRangeChange={handleDateRangeChange} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
