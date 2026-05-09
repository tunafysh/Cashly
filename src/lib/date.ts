export function parseDate(input: string, max: boolean): Date | undefined {
  if (!input) return undefined;

  // YYYY
  const yearOnly = /^\d{4}$/;
  if (yearOnly.test(input)) {
    const year = Number(input);

    return max
      ? new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))
      : new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  }

  // YYYY-MM
  const yearMonth = /^\d{4}-\d{2}$/;
  if (yearMonth.test(input)) {
    const [yearStr, monthStr] = input.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);

    return max
      ? new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
      : new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  }

  // YYYY-MM-DD
  const yearMonthDay = /^\d{4}-\d{2}-\d{2}$/;
  if (yearMonthDay.test(input)) {
    const [yearStr, monthStr, dayStr] = input.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    return max
      ? new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
      : new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  }

  // YYYY-MM-DDTHH:mm
  const dateAndTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  if (dateAndTime.test(input)) {
    const [datePart, timePart] = input.split("T");

    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    return max
      ? new Date(Date.UTC(year, month - 1, day, hour, minute, 59, 999))
      : new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
  }

  throw new Error(`Invalid date format: ${input}, expected YYYY, YYYY-MM, YYYY-MM-DD or YYYY-MM-DDTHH:mm`);
}