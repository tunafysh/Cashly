"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { capitalize, formatCurrency } from "@/lib/utils";
import { Progress } from "../ui/progress";
import { useProfile } from "@/lib/profile-context";
import { useEffect, useState } from "react";

function getProgressVariant(percentage: number) {
  if (percentage < 80) return "default";
  if (percentage < 100) return "warning";
  return "destructive";
}

type ApiSummary = {
  balance: number;
  income: number;
  expenses: number;
};

type Summary = {
  spent: number;
  budget: number;
};

export default function BudgetCard() {
  const { profile } = useProfile();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/summary", {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const data: ApiSummary = await res.json();

        setSummary({
          spent: data.expenses,
          budget: profile?.budget ?? data.income,
        });
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => controller.abort();
  }, []);

  if (!profile) return null;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Loading budget…
        </CardContent>
      </Card>
    );
  }

  if (error || !summary) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          Failed to load budget: {error ?? "Unknown error"}
        </CardContent>
      </Card>
    );
  }

  const budget = profile.budget ?? 0;
  const spent = summary.spent;

  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = budget - spent;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">
          {`${capitalize(profile.budgetPeriod)}ly Budget`}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">
              {formatCurrency(spent, profile.currency)}
            </p>
            <p className="text-sm text-muted-foreground">
              of {formatCurrency(budget, profile.currency)} spent
            </p>
          </div>

          <div className="text-sm font-medium text-muted-foreground">
            {Math.round(percentage)}%
          </div>
        </div>

        <Progress
          value={percentage}
          className="h-3"
          variant={getProgressVariant(percentage)}
        />

        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatCurrency(remaining, profile.currency)} remaining</span>

          <span>{spent > budget ? "Over budget" : "On track"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
