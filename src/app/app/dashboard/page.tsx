"use client";
import { ChartAreaInteractive } from "@/components/elements/chart-area-interactive";
import { SectionCards } from "@/components/elements/section-cards";
import { useState } from "react";
import DataTable from "@/components/elements/data-table";
import { formatCurrency } from "@/lib/utils";
import { useProfile } from "@/lib/profile-context";
import BudgetCard from "@/components/elements/budget-card";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<{
    fromDate?: Date;
    toDate?: Date;
  }>({});

  const { profile } = useProfile();

  const handleDateRangeChange = (fromDate?: Date, toDate?: Date) => {
    setDateRange({ fromDate, toDate });
  };

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards
              fromDate={dateRange.fromDate}
              toDate={dateRange.toDate}
              currency={profile?.currency}
            />
            { profile?.budget && <BudgetCard />}
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive onDateRangeChange={handleDateRangeChange} />
            </div>
            <DataTable currency={profile?.currency} />
          </div>
        </div>
      </div>
    </>
  );
}
