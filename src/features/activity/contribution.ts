import type { ActivityItem } from "../../providers/activity/activityProvider";

export interface ContributionDay {
  date: string;
  label: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  future: boolean;
  month?: string;
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function levelFor(count: number): ContributionDay["level"] {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

export function buildContributionWeeks(items: ActivityItem[], now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - end.getDay()));
  const start = new Date(end);
  start.setDate(start.getDate() - (53 * 7 - 1));

  const counts = new Map<string, number>();
  for (const item of items) {
    const date = new Date(item.timestamp);
    if (!Number.isNaN(date.getTime())) {
      const key = dateKey(date);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const days: ContributionDay[] = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const key = dateKey(cursor);
    const count = counts.get(key) ?? 0;
    days.push({
      date: key,
      label: cursor.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      count,
      level: levelFor(count),
      future: cursor > today,
      month: cursor.getDate() === 1 ? cursor.toLocaleDateString(undefined, { month: "short" }) : undefined,
    });
  }

  return Array.from({ length: 53 }, (_, index) => days.slice(index * 7, index * 7 + 7));
}
