/** Local calendar date as YYYY-MM-DD (matches Postgres `date` for session rows). */
export function formatLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDateStringYYYYMMD(dateString: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const monthIndex0 = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsed = new Date(year, monthIndex0, day, 12, 0, 0, 0);
  if (parsed.getFullYear() !== year || parsed.getMonth() !== monthIndex0 || parsed.getDate() !== day) {
    return null;
  }
  return parsed;
}

/**
 * “Now” for calendar features (sessions, charts). In development, set `REACT_APP_DEV_FAKE_TODAY`
 * to a local `YYYY-MM-DD` to test another day without changing the system clock. Does not affect
 * `Date.now()` / timers — only code that imports this for year/month/today.
 */
export function getAppNow(): Date {
  const raw = process.env.REACT_APP_DEV_FAKE_TODAY;
  if (process.env.NODE_ENV === "development" && raw) {
    const parsed = parseLocalDateStringYYYYMMD(raw);
    if (parsed) {
      return parsed;
    }
  }
  return new Date();
}

export function todayLocalISODate(): string {
  return formatLocalISODate(getAppNow());
}
