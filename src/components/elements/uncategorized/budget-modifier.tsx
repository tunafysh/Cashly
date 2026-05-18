"use client"

import * as React from "react"
import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProfile } from "@/lib/profile-context"

const BUDGET_VARIANTS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
]

export function BudgetModifier() {
  const { profile, updateProfile } = useProfile()
  const [goal, setGoal] = React.useState(() => Number(profile?.budget) || 350)
  const [isEditing, setIsEditing] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(goal.toString())
  const [variant, setVariant] = React.useState(profile?.budgetPeriod || "monthly")
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (profile?.budget) {
      const budgetNum = Number(profile.budget)
      setGoal(budgetNum)
      setInputValue(budgetNum.toString())
    }
    if (profile?.budgetPeriod) {
      setVariant(profile.budgetPeriod)
    }
  }, [profile?.budget, profile?.budgetPeriod])

  function onClick(adjustment: number) {
    const newGoal = Math.max(200, Math.min(400, goal + adjustment))
    setGoal(newGoal)
    setInputValue(newGoal.toString())
    handleSaveBudget(newGoal)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value)
  }

  function handleSaveBudget(budgetValue: number) {
    if (isLoading || !updateProfile) return
    setIsLoading(true)
    updateProfile({ budget: budgetValue })
      .catch((error) => {
        console.error("Failed to update budget:", error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  function handleSaveVariant(newVariant: string) {
    if (isLoading || !updateProfile) return
    setIsLoading(true)
    updateProfile({ budgetPeriod: newVariant })
      .catch((error) => {
        console.error("Failed to update budget period:", error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  function handleInputBlur() {
    const num = parseInt(inputValue, 10)
    if (!isNaN(num) && num >= 200 && num <= 400) {
      setGoal(num)
      handleSaveBudget(num)
    } else {
      setInputValue(goal.toString())
    }
    setIsEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleInputBlur()
    } else if (e.key === "Escape") {
      setInputValue(goal.toString())
      setIsEditing(false)
    }
  }

  function handleVariantChange(newVariant: string) {
    setVariant(newVariant)
    handleSaveVariant(newVariant)
  }

  const variantLabel = BUDGET_VARIANTS.find(v => v.value === variant)?.label || "Monthly"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Budget Goal</CardTitle>
            <CardDescription>Set your {variantLabel.toLowerCase()} budget target</CardDescription>
          </div>
          <Select value={variant} onValueChange={handleVariantChange} disabled={isLoading}>
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
            disabled={goal <= 200 || isLoading}
          >
            <Minus className="h-4 w-4" />
            <span className="sr-only">Decrease</span>
          </Button>

          {isEditing ? (
            <Input
              autoFocus
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              className="w-24 text-center text-4xl font-bold"
              min="200"
              max="400"
              disabled={isLoading}
            />
          ) : (
            <div
              onClick={() => !isLoading && setIsEditing(true)}
              className={isLoading ? "cursor-not-allowed text-center" : "cursor-pointer text-center"}
            >
              <div className="text-5xl font-bold tracking-tighter">
                {goal}
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
            disabled={goal >= 400 || isLoading}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
