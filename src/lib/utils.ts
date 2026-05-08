import { Filters } from "@/db/queries/transactions";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parseDate } from "./date";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseTransactionFilters(body: any): Filters {
  const fromDate = parseDate(body.fromDate);
  const toDate = parseDate(body.toDate);
  return {
    fromDate: body.fromDate ? fromDate : undefined,
    toDate: body.toDate ? toDate : undefined,
    categoryId: body.categoryId,
    type: body.type,
    withDescription: body.withDescription,
  };
}