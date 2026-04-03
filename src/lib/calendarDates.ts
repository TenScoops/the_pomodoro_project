/** Local calendar date as YYYY-MM-DD (matches Postgres `date` for session rows). */
export function formatLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayLocalISODate(): string {
  return formatLocalISODate(new Date());
}
