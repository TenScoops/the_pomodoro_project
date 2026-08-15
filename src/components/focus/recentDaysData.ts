export type WorkType = "Deep Work" | "Routine";
export type LoadScore = 1 | 2 | 3 | 4 | 5;

export type RecentDaySummaryCard = {
  id: "hours" | "load" | "productivity";
  label: string;
  value: string;
};

export type RecentDayRow = {
  id: string;
  dateLabel: string;
  dateDetail: string | null;
  workType: WorkType;
  load: LoadScore;
  hours: string;
  notes: string;
};

// Placeholder numbers so the Focus page has a filled table before real session data is wired up.
export const RECENT_DAY_SUMMARY_CARDS: RecentDaySummaryCard[] = [
  { id: "hours", label: "Total Work Hours", value: "2h 18m" },
  { id: "load", label: "Average Load", value: "3.2 / 5" },
  { id: "productivity", label: "Productivity Avg.", value: "8.7 / 10" },
];

export const RECENT_DAY_ROWS: RecentDayRow[] = [
  {
    id: "may14",
    dateLabel: "Today",
    dateDetail: "May 14, 2024",
    workType: "Deep Work",
    load: 4,
    hours: "2h 18m",
    notes: "Focused on project...",
  },
  {
    id: "may13",
    dateLabel: "Yesterday",
    dateDetail: "May 13, 2024",
    workType: "Routine",
    load: 3,
    hours: "3h 42m",
    notes: "Admin and emails",
  },
  {
    id: "may12",
    dateLabel: "May 12, 2024",
    dateDetail: null,
    workType: "Deep Work",
    load: 4,
    hours: "1h 55m",
    notes: "Research and planning",
  },
  {
    id: "may11",
    dateLabel: "May 11, 2024",
    dateDetail: null,
    workType: "Routine",
    load: 2,
    hours: "2h 10m",
    notes: "Light tasks",
  },
];
