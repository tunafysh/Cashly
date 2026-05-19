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
    // Common patterns - match "from X to/until Y" or "from X" or "to/until Y"
    const fromToPattern = /from\s+(.+?)(?:\s+(?:to|until)\s+(.+?))?$/i;

    let fromMatch = fromToPattern.exec(input);
    let fromText = "";
    let toText = "";

    if (fromMatch) {
      fromText = fromMatch[1];
      toText = fromMatch[2] || "";

      let parsedAny = false;

      const fromDate = chrono.parseDate(fromText);
      if (fromDate) {
        result.fromDate = fromDate.toISOString().split("T")[0];
        parsedAny = true;
      }

      if (toText) {
        const toDate = chrono.parseDate(toText);
        if (toDate) {
          result.toDate = toDate.toISOString().split("T")[0];
          parsedAny = true;
        }
      }

      // If fromDate is set but toDate is not, default toDate to the same day as fromDate
      // unless "until now" or similar was explicitly mentioned
      if (result.fromDate && !result.toDate) {
        const hasExplicitUntil = /until\s+now|to\s+now/i.test(input);
        if (!hasExplicitUntil) {
          result.toDate = result.fromDate;
        }
      }

      // Remove the pattern from search if we successfully parsed at least one date
      if (parsedAny) {
        result.search = input.replace(fromMatch[0], "").trim();
      }
    }

    // Handle standalone "until/to" pattern if no "from" was found
    if (!fromMatch) {
      const untilPattern = /(?:until|to)\s+(.+?)$/i;
      const untilMatch = untilPattern.exec(input);
      if (untilMatch) {
        const untilText = untilMatch[1];
        const untilDate = chrono.parseDate(untilText);
        if (untilDate) {
          result.toDate = untilDate.toISOString().split("T")[0];
          result.search = input.replace(untilMatch[0], "").trim();
        }
      }
    }

    // If only set toDate without fromDate, don't auto-set fromDate
    // This allows "until now" to work without forcing a fromDate
  } catch (error) {
    console.error("Error parsing natural language date:", error);
  }

  return result;
}
