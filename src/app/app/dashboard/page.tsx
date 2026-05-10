"use client";
import { ChartAreaInteractive } from "@/components/elements/chart-area-interactive";
import { SectionCards } from "@/components/elements/section-cards";
import { useEffect, useState } from "react";
import DataTable from "@/components/elements/data-table";
import { formatCurrency } from "@/lib/utils";
import { UserProfile } from "@/db/queries/profiles";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<{
    fromDate?: Date;
    toDate?: Date;
  }>({});

  const [profile, setProfile] = useState<UserProfile>();

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) {
          throw new Error("Failed to load profile");
        }
        const data = await response.json();
        setProfile(data.profile);
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    }
    loadProfile();
  }, []);

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
