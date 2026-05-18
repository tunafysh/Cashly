"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface QuickCreateSubscriptionFormProps {
  onSuccess?: () => void;
}

export function QuickCreateSubscriptionForm({
  onSuccess,
}: QuickCreateSubscriptionFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "monthly" as "monthly" | "yearly",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error("Please enter a subscription name");
      }

      if (!formData.amount || isNaN(parseFloat(formData.amount))) {
        throw new Error("Please enter a valid amount");
      }

      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          amount: parseFloat(formData.amount),
          type: formData.type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create subscription");
      }

      setFormData({ name: "", amount: "", type: "monthly" });
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Quick Add
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Subscription</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 dark:bg-red-950">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                type="text"
                placeholder="e.g., Netflix, Spotify"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={loading}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Frequency
              </label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    type: value as "monthly" | "yearly",
                  })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Subscription"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
