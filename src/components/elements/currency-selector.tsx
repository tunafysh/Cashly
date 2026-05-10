"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

function updateCurrency(value: string) {
  console.log("Selected currency:", value);

  fetch("/api/profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currency: value }),
  });
}

export default function CurrencySelector({ currency }: { currency?: string }) {
  return (
    <Select value={currency} onValueChange={(value) => updateCurrency(value)}>
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
