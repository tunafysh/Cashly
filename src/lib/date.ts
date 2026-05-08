export function parseDate(input: string, max: boolean): Date | undefined {
  const yearOnly = /^\d{4}$/;
  const monthOnly = /^\d{2}$/;
  const dayOnly = /^\d{2}$/; // can't believe i am repeating this but whatever
  const yearMonth = /^\d{2}-\d{4}$/;
  const yearMonthDay = /^\d{2}-\d{2}-\d{4}$/;

  // YYYY
  if (yearOnly.test(input)) {
    const year = Number(input);
    if (max) return new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

    return new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  }

  // YYYY-MM
  if (yearMonth.test(input)) {
    const [monthStr, yearStr] = input.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);

    if (max) return new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  }

  // YYYY-MM-DD
  if (yearMonthDay.test(input)) {
    const [dayStr, monthStr, yearStr] = input.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    if (max) return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  }

  if (monthOnly.test(input) && Number(input) >= 1 && Number(input) <= 12) {
    const month = Number(input);

    if (max) return new Date(Date.UTC(0, month, 0, 23, 59, 59, 999));

    return new Date(Date.UTC(0, month - 1, 1, 0, 0, 0, 0));
  }

  if (dayOnly.test(input) && Number(input) >= 1 && Number(input) <= 31) {
    const day = Number(input);

    if (max) return new Date(Date.UTC(0, 0, day, 23, 59, 59, 999));

    return new Date(Date.UTC(0, 0, day, 0, 0, 0, 0));
  }

  if (input === "" || input === null || input === undefined) {
    return undefined;
  }

  throw new Error("Invalid date format. Use YYYY, MM-YYYY, or DD-MM-YYYY");
}
