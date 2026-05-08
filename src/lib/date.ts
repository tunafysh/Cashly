export function parseDate(input: string): Date {
  const yearOnly = /^\d{4}$/;
  const monthOnly = /^\d{2}$/;
  const dayOnly = /^\d{2}$/; // can't believe i am repeating this but whatever
  const yearMonth = /^\d{4}-\d{2}$/;
  const yearMonthDay = /^\d{4}-\d{2}-\d{2}$/;

  // YYYY
  if (yearOnly.test(input)) {
    const year = Number(input);
    return new Date(year, 0, 1, 0, 0, 0, 0);
  }

  // YYYY-MM
  if (yearMonth.test(input)) {
    const [yearStr, monthStr] = input.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);

    return new Date(year, month - 1, 1, 0, 0, 0, 0);
  }

  // YYYY-MM-DD
  if (yearMonthDay.test(input)) {
    const [yearStr, monthStr, dayStr] = input.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  if (monthOnly.test(input)&& Number(input)>=1 && Number(input)<=12) {
    const month = Number(input);
    return new Date(0, month - 1, 1, 0, 0, 0, 0);
  }

  if (dayOnly.test(input)&& Number(input)>=1 && Number(input)<=31) {
    const day = Number(input);
    return new Date(0, 0, day, 0, 0, 0, 0);
  }

  throw new Error("Invalid date format. Use YYYY, YYYY-MM, or YYYY-MM-DD");
}