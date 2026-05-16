import * as chrono from "chrono-node";

export interface ParsedDateRange {
  search: string;
  fromDate?: string;
  toDate?: string;
}

export function parseNaturalLanguageSearch(input: string): ParsedDateRange {
  // Patterns for natural language dates
  const result: ParsedDateRange = { search: input };

  if (!input.trim()) return result;

  try {
    // Common patterns
    const fromPattern = /from\s+(.+?)(?:\s+to\s+|$)/gi;
    const toPattern = /to\s+(.+?)$/gi;
    
    let fromMatch = fromPattern.exec(input);
    let toMatch = toPattern.exec(input);

    if (fromMatch) {
      const fromText = fromMatch[1];
      const fromDate = chrono.parseDate(fromText);
      if (fromDate) {
        result.fromDate = fromDate.toISOString().split("T")[0];
        // Remove the parsed part from search
        result.search = input.replace(fromMatch[0], "").trim();
      }
    }

    if (toMatch) {
      const toText = toMatch[1];
      const toDate = chrono.parseDate(toText);
      if (toDate) {
        result.toDate = toDate.toISOString().split("T")[0];
        // Remove the parsed part from search
        result.search = result.search.replace(toMatch[0], "").trim();
      }
    }

    // If only one date is mentioned, assume it's a single day
    if ((result.fromDate || result.toDate) && !result.fromDate && result.toDate) {
      result.fromDate = result.toDate;
    } else if (result.fromDate && !result.toDate) {
      result.toDate = result.fromDate;
    }
  } catch (error) {
    console.error("Error parsing natural language date:", error);
  }

  return result;
}
