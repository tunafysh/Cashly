"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "An interactive area chart";

export type Transaction = {
  id: string;
  amount: string;
  type: "income" | "expense";
  description?: string | null;
  createdAt: string;

  category: {
    id: string;
    name: string;
    color: string;
  };
};

type ChartData = {
  date: string;
  income: number;
  expenses: number;
  balance: number;
};

export function aggregateTransactions(
  transactions: Transaction[],
): ChartData[] {
  const analyticsMap = new Map<string, ChartData>();

  for (const transaction of transactions) {
    const date = new Date(transaction.createdAt).toISOString().split("T")[0];

    if (!analyticsMap.has(date)) {
      analyticsMap.set(date, {
        date,
        income: 0,
        expenses: 0,
        balance: 0,
      });
    }

    const entry = analyticsMap.get(date)!;

    const amount = Number(transaction.amount);

    if (transaction.type === "income") {
      entry.income += amount;
      entry.balance += amount;
    }

    if (transaction.type === "expense") {
      entry.expenses += amount;
      entry.balance -= amount;
    }
  }

  return Array.from(analyticsMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

const chartConfig = {
  balance: {
    label: "Balance",
  },
  income: {
    label: "Income",
    color: "var(--primary)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({
  onDateRangeChange,
}: {
  onDateRangeChange?: (fromDate?: Date, toDate?: Date) => void;
}) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const [chartData, setChartData] = React.useState<ChartData[]>([]);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  React.useEffect(() => {
    async function fetchChartData() {
      const referenceDate = new Date();

      let daysToSubtract = 90;

      if (timeRange === "30d") {
        daysToSubtract = 30;
      }

      if (timeRange === "7d") {
        daysToSubtract = 7;
      }

      const fromDate = new Date(referenceDate);

      fromDate.setUTCDate(fromDate.getUTCDate() - daysToSubtract);
      fromDate.setUTCHours(0, 0, 0, 0);

      const params = new URLSearchParams({
        fromDate: fromDate.toISOString(),
        toDate: referenceDate.toISOString(),
      });

      const response = await fetch(`/api/transactions?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();

      setChartData(aggregateTransactions(data.transactions));
    }

    fetchChartData();
  }, [timeRange]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Transactions</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Transactions for the last{" "}
            {timeRange === "90d"
              ? "3 months"
              : timeRange === "30d"
                ? "30 days"
                : "7 days"}
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-income)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-income)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-expenses)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-expenses)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="expenses"
              type="natural"
              fill="url(#fillExpenses)"
              stroke="var(--color-expenses)"
              stackId="a"
            />
            <Area
              dataKey="income"
              type="natural"
              fill="url(#fillIncome)"
              stroke="var(--color-income)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
