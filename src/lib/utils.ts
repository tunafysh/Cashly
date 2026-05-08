import { Filters } from "@/db/queries/transactions";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parseDate } from "./date";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseTransactionFilters(body: any): Filters | undefined {
  if (!body) return undefined;

  const filters: Filters = {};

  if (body.fromDate && body.fromDate !== "") {
    const parsed = parseDate(body.fromDate, false);
    if (parsed) filters.fromDate = parsed;
  }

  if (body.toDate && body.toDate !== "") {
    const parsed = parseDate(body.toDate, true);
    if (parsed) filters.toDate = parsed;
  }

  if (body.categoryId) {
    filters.categoryId = body.categoryId;
  }

  if (body.type) {
    filters.type = body.type;
  }

  if (body.withDescription !== undefined) {
    filters.withDescription = body.withDescription;
  }

  return Object.keys(filters).length > 0 ? filters : undefined;
}
