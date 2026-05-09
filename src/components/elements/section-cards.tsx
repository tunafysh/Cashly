"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { useEffect, useState } from "react";

type SummaryData = {
  balance: number;
  income: number;
  expenses: number;
};

function SectionCard({
  title,
  value,
  label,
  loading,
  trend,
  trendIcon,
  fromDate,
  toDate
}: {
  title: string;
  value: number;
  label: string;
  loading: boolean;
  trend: string;
  trendIcon: React.ReactNode;
  fromDate?: Date;
  toDate?: Date;
}) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          ${value.toFixed(2)}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            {trendIcon}
            {trend}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {label} {loading ? "loading..." : "loaded"}
        </div>
        <div className="text-muted-foreground">
          {fromDate || toDate ? "Filtered period" : "All time"}
        </div>
      </CardFooter>
    </Card>
  );
}

export function SectionCards({
  fromDate,
  toDate,
}: {
  fromDate?: Date;
  toDate?: Date;
}) {
  const [data, setData] = useState<SummaryData>({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (fromDate) {
          params.append("fromDate", fromDate.toISOString().split("T")[0]);
        }
        if (toDate) {
          params.append("toDate", toDate.toISOString().split("T")[0]);
        }

        const response = await fetch(`/api/summary?${params.toString()}`);

        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [fromDate, toDate]);

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <SectionCard
        title="Balance"
        value={data.balance}
        label={`Net balance ${data.balance >= 0 ? "positive" : "negative"}`}
        loading={loading}
        trend={data.balance >= 0 ? `+${data.balance.toFixed(2)}` : `${data.balance.toFixed(2)}`}
        trendIcon={data.balance >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
        fromDate={fromDate}
        toDate={toDate}
      />
      <SectionCard 
        title="Total Expenses"
        value={data.expenses}
        label="Expenses tracked"
        loading={loading}
        trend="-20%"
        trendIcon={<TrendingDownIcon />}
        fromDate={fromDate}
        toDate={toDate}
      />
      <SectionCard
        title="Total Income"
        value={data.income}
        label="Income tracked"
        loading={loading}
        trend="+12.5%"
        trendIcon={<TrendingUpIcon />}
        fromDate={fromDate}
        toDate={toDate}
      />
      <SectionCard
        title="Transaction Count"
        value={0}
        label="Filter active transactions"
        loading={loading}
        trend="active"
        trendIcon={<TrendingUpIcon />}
        fromDate={fromDate}
        toDate={toDate}
      />
    </div>
  );
}
