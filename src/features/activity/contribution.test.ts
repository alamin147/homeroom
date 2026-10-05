import { describe, expect, it } from "vitest";
import type { ActivityItem } from "../../providers/activity/activityProvider";
import { buildContributionWeeks } from "./contribution";

describe("buildContributionWeeks", () => {
  it("creates a GitHub-style calendar and groups activity by local day", () => {
    const items = [
      { id: "1", action: "created", entityType: "task", entityName: "One", timestamp: "2026-10-05T08:00:00" },
      { id: "2", action: "updated", entityType: "task", entityName: "One", timestamp: "2026-10-05T18:00:00" },
    ] satisfies ActivityItem[];

    const weeks = buildContributionWeeks(items, new Date("2026-10-05T12:00:00"));
    const day = weeks.flat().find(({ date }) => date === "2026-10-05");

    expect(weeks).toHaveLength(53);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(day).toMatchObject({ count: 2, level: 2, future: false });
  });
});
