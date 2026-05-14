"use client";
import { useProfile } from "@/lib/profile-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

export default function CurrencySelector() {
  const { profile, updateProfile } = useProfile();
  const [currency, setCurrency] = useState(profile?.currency || "USD");

  useEffect(() => {
    if (profile?.currency) {
      setCurrency(profile.currency);
    }
  }, [profile]);

  const handleCurrencyChange = async (value: string) => {
    setCurrency(value);
    try {
      if (updateProfile) await updateProfile({ currency: value } as any);
    } catch (error) {
      console.error("Failed to update currency:", error);
      // Revert on error
      setCurrency(profile?.currency || "USD");
    }
  };

  return (
    <Select value={currency} onValueChange={handleCurrencyChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value="USD" className="rounded-lg">
          USD - US Dollar
        </SelectItem>
        <SelectItem value="EUR" className="rounded-lg">
          EUR - Euro
        </SelectItem>
        <SelectItem value="GBP" className="rounded-lg">
          GBP - British Pound
        </SelectItem>
        <SelectItem value="JPY" className="rounded-lg">
          JPY - Japanese Yen
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
