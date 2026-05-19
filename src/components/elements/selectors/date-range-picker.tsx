"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  onDateRangeChange: (from: string, to: string) => void;
  value?: { from?: string; to?: string };
}

export function DateRangePicker({
  onDateRangeChange,
  value,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    if (value?.from || value?.to) {
      return {
        from: value.from ? new Date(value.from) : undefined,
        to: value.to ? new Date(value.to) : undefined,
      };
    }
    return undefined;
  });

  const handleDateSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (newDate?.from) {
      const fromString = format(newDate.from, "yyyy-MM-dd");
      const toString = newDate.to
        ? format(newDate.to, "yyyy-MM-dd")
        : fromString;
      onDateRangeChange(fromString, toString);
    } else {
      onDateRangeChange("", "");
    }
  };

  const displayText = date?.from
    ? date.to
      ? `${format(date.from, "MMM dd")} - ${format(date.to, "MMM dd")}`
      : format(date.from, "MMM dd")
    : "Pick a date range";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="justify-start text-left font-normal text-sm w-full"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="truncate">{displayText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleDateSelect}
          numberOfMonths={2}
          disabled={(d) => d > new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
