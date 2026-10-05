import { afterEach, describe, expect, it, vi } from "vitest";
import { migrateLegacyDemoData } from "./dataMigrations";

afterEach(() => vi.unstubAllGlobals());

describe("migrateLegacyDemoData", () => {
  it("removes known demo records while preserving user data", () => {
    const values = new Map<string, string>([
      ["homeroom.projects", JSON.stringify([{ id: "project_home-office" }, { id: "project-user" }])],
      ["homeroom.activity", JSON.stringify([{ entityName: "Garden thought" }, { entityName: "My project" }])],
      ["homeroom.settings", JSON.stringify({ "home.widgets": ["focus", "projects", "today"] })],
    ]);
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });

    migrateLegacyDemoData();

    expect(JSON.parse(values.get("homeroom.projects")!)).toEqual([{ id: "project-user" }]);
    expect(JSON.parse(values.get("homeroom.activity")!)).toEqual([{ entityName: "My project" }]);
    expect(JSON.parse(values.get("homeroom.settings")!)["home.widgets"]).toEqual(["projects"]);
    expect(values.get("homeroom.data-version")).toBe("2");
  });
});
