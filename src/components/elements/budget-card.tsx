e ""use client"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { capitalize, formatCurrency } from "@/lib/utils"
import { Progress } from "../ui/progress"
import { useProfile } from "@/lib/profile-context"
import { useEffect, useState } from "react"

function getProgressVariant(percentage: number) {
    if (percentage < 80) return "default"
    if (percentage < 100) return "warning"
    return "destructive"
}

export default function BudgetCard() {
    const { profile } = useProfile();
    const [summary, setSummary] = useState<{ spent: number; budget: number } | null>(null);

    useEffect(() => {
        fetch("/api/summary")
            .then((res) => res.json())
            .then((data) => {
                setSummary(data);
            })
            .catch((error) => {
                console.error("Failed to fetch summary:", error);
            });
    }, []);

    if (!profile || !summary) return null;
    const data = summary;
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
          {formatCurrency(data.spent, profile.currency)}
        </p>
        <p className="text-sm text-muted-foreground">
          of {formatCurrency(profile.budget ?? 0, profile.currency)} spent
        </p>
      </div>

      <div className="text-sm font-medium text-muted-foreground">
        {Math.round((data.spent / (profile.budget ?? 1)) * 100)}%
      </div>
    </div>

    <Progress
      value={(data.spent / (profile.budget ?? 1)) * 100}
      className="h-3"
      variant={getProgressVariant(
        (data.spent / (profile.budget ?? 1)) * 100
      )}
    />

    <div className="flex justify-between text-sm text-muted-foreground">
      <span>
        {formatCurrency((profile.budget ?? 0) - data.spent, profile.currency)} remaining
      </span>

      <span>
        {data.spent > (profile.budget ?? 0)
          ? "Over budget"
          : "On track"}
      </span>
    </div>
  </CardContent>
</Card>
    )
}