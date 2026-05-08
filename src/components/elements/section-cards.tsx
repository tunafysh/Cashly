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

function sectionCard(data: SummaryData, loading: boolean, fromDate?: Date, toDate?: Date) {
  <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Income</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${data.income.toFixed(2)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Income {loading ? "loading..." : "loaded"}
          </div>
          <div className="text-muted-foreground">
            {fromDate || toDate ? "Filtered period" : "All time"}
          </div>
        </CardFooter>
      </Card>
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
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Expenses</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${data.expenses.toFixed(2)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingDownIcon />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Expenses tracked <TrendingDownIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {fromDate || toDate ? "Filtered period" : "All time"}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Balance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${data.balance.toFixed(2)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {data.balance >= 0 ? (
                <>
                  <TrendingUpIcon />+{data.balance.toFixed(2)}
                </>
              ) : (
                <>
                  <TrendingDownIcon />
                  {data.balance.toFixed(2)}
                </>
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Net balance {data.balance >= 0 ? "positive" : "negative"}{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {fromDate || toDate ? "Filtered period" : "All time"}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Transaction Count</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            -
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Filter active transactions <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {fromDate || toDate ? "Filtered period" : "All time"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
