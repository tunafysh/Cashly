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
  console.log("BudgetCard: rendering");
  const { profile } = useProfile();
  console.log("BudgetCard: profile loaded", profile);

  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log("BudgetCard: initial state - loading:", loading, "summary:", summary, "error:", error);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        console.log("BudgetCard: load() starting");
        setLoading(true);
        setError(null);

        const res = await fetch("/api/summary", {
          signal: controller.signal,
        });
        console.log("BudgetCard: fetch response received", res.ok, res.status);

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const data: ApiSummary = await res.json();
        console.log("BudgetCard: API data", data);

        const newSummary = {
          spent: data.expenses,
          budget: profile?.budget ?? data.income,
        };
        console.log("BudgetCard: setting summary", newSummary);
        setSummary(newSummary);
      } catch (err: any) {
        console.error("BudgetCard: error caught", err);
        if (err.name === "AbortError") {
          console.log("BudgetCard: request aborted");
          return;
        }
        const errorMsg = err.message ?? "Something went wrong";
        console.log("BudgetCard: setting error", errorMsg);
        setError(errorMsg);
      } finally {
        console.log("BudgetCard: load() finally block");
        setLoading(false);
      }
    }

    load();

    return () => {
      console.log("BudgetCard: useEffect cleanup - aborting");
      controller.abort();
    };
  }, []);

  if (!profile) {
    console.log("BudgetCard: no profile, returning null");
    return null;
  }

  if (loading) {
    console.log("BudgetCard: loading state, showing loading message");
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Loading budget…
        </CardContent>
      </Card>
    );
  }

  if (error || !summary) {
    console.log("BudgetCard: error or no summary, showing error message", error, summary);
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          Failed to load budget: {error ?? "Unknown error"}
        </CardContent>
      </Card>
    );
  }

  const budget = typeof summary.budget === "string" ? Number(summary.budget) : summary.budget;
  const spent = summary.spent;

  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = budget - spent;

  console.log("BudgetCard: rendering with calculations", {
    budget,
    spent,
    percentage,
    remaining,
    currency: profile.currency,
    budgetPeriod: profile.budgetPeriod,
  });

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
