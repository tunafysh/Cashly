"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile } from "@/lib/profile-context";

const BUDGET_VARIANTS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function BudgetModifier() {
  const { profile, updateProfile } = useProfile();
  const [goal, setGoal] = React.useState<number | null>(() =>
    profile?.budget ? Number(profile.budget) : null,
  );
  const [isEditing, setIsEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(goal?.toString() || "");
  const [variant, setVariant] = React.useState(
    profile?.budgetPeriod || "monthly",
  );
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (profile?.budget !== undefined) {
      const budgetNum = profile.budget ? Number(profile.budget) : null;
      setGoal(budgetNum);
      setInputValue(budgetNum?.toString() || "");
    }
    if (profile?.budgetPeriod) {
      setVariant(profile.budgetPeriod);
    }
  }, [profile?.budget, profile?.budgetPeriod]);

  function onClick(adjustment: number) {
    const currentGoal = goal ?? 0;
    const newGoal = Math.max(0, currentGoal + adjustment);
    const rounded = Math.round(newGoal * 100) / 100;
    setGoal(rounded);
    setInputValue(rounded.toString());
    handleSaveBudget(rounded);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function handleSaveBudget(budgetValue: number | null) {
    if (isLoading || !updateProfile) return;
    setIsLoading(true);
    const valueToSave = budgetValue !== null ? budgetValue : null;
    updateProfile({ budget: valueToSave })
      .catch((error) => {
        console.error("Failed to update budget:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleSaveVariant(newVariant: string) {
    if (isLoading || !updateProfile) return;
    setIsLoading(true);
    updateProfile({ budgetPeriod: newVariant })
      .catch((error) => {
        console.error("Failed to update budget period:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleInputBlur() {
    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      setInputValue(goal?.toString() || "");
      setIsEditing(false);
      return;
    }
    if (num < 0) {
      setGoal(null);
      setInputValue("");
      handleSaveBudget(null);
    } else {
      const rounded = Math.round(num * 100) / 100;
      setGoal(rounded);
      setInputValue(rounded.toString());
      handleSaveBudget(rounded);
    }
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleInputBlur();
    } else if (e.key === "Escape") {
      setInputValue(goal?.toString() || "0");
      setIsEditing(false);
    }
  }

  function handleVariantChange(newVariant: string) {
    setVariant(newVariant);
    handleSaveVariant(newVariant);
  }

  const variantLabel =
    BUDGET_VARIANTS.find((v) => v.value === variant)?.label || "Monthly";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Budget Goal</CardTitle>
            <CardDescription>
              Set your {variantLabel.toLowerCase()} budget target
            </CardDescription>
          </div>
          <Select
            value={variant}
            onValueChange={handleVariantChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_VARIANTS.map((v) => (
                <SelectItem key={v.value} value={v.value}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full"
            onClick={() => onClick(-10)}
            disabled={(goal ?? 0) <= 0 || isLoading}
          >
            <Minus className="h-4 w-4" />
            <span className="sr-only">Decrease</span>
          </Button>

          {isEditing ? (
            <Input
              autoFocus
              type="number"
              step="0.01"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              className="w-32 text-center text-3xl font-bold"
              min="0"
              disabled={isLoading}
            />
          ) : (
            <div
              onClick={() => !isLoading && setIsEditing(true)}
              className={
                isLoading
                  ? "cursor-not-allowed text-center"
                  : "cursor-pointer text-center"
              }
            >
              <div className="flex items-baseline justify-center gap-1">
                <div className="text-5xl font-bold tracking-tighter">
                  {goal === null || goal === 0 ? "—" : Math.floor(goal!)}
                </div>
                {goal && goal > Math.floor(goal) && (
                  <div className="text-sm font-semibold text-muted-foreground">
                    {String((goal * 100) % 100).padStart(2, "0")}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground uppercase">
                {isLoading ? "Saving..." : "Click to edit"}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full"
            onClick={() => onClick(10)}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
