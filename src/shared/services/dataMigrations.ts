const versionKey = "homeroom.data-version";
const dataVersion = 2;

const demoIds: Record<string, Set<string>> = {
  "homeroom.projects": new Set(["project_home-office", "project-finance"]),
  "homeroom.documents": new Set(["document-office-plan", "document-weekly-review"]),
  "homeroom.tasks": new Set(["task-review-budget", "task-measure-desk", "task-compare-lights"]),
  "homeroom.notes": new Set(["note-week", "note-idea"]),
  "homeroom.library": new Set(["resource-design", "resource-github"]),
  "homeroom.media": new Set(["media-four-thousand-weeks", "media-perfect-days"]),
  "homeroom.apps": new Set(["app-github", "app-figma", "app-calendar"]),
  "homeroom.services": new Set(["service-router", "service-github"]),
};

const demoNames = new Set([
  "Refresh the home office", "Personal finance reset", "Office refresh plan", "Weekly review ritual",
  "Review recurring subscriptions", "Measure the desk wall", "Compare the final two desk lights",
  "Garden thought", "Designing calm workspaces", "Four Thousand Weeks", "Perfect Days", "Home router",
]);

function filterArray(key: string, keep: (value: Record<string, unknown>) => boolean) {
  const stored = localStorage.getItem(key);
  if (!stored) return;
  try {
    const values = JSON.parse(stored) as unknown;
    if (Array.isArray(values)) localStorage.setItem(key, JSON.stringify(values.filter((value) => typeof value !== "object" || value === null || keep(value as Record<string, unknown>))));
  } catch { /* repositories surface malformed user data separately */ }
}

export function migrateLegacyDemoData(force = false) {
  if (!force && Number(localStorage.getItem(versionKey) ?? 0) >= dataVersion) return;
  for (const [key, ids] of Object.entries(demoIds)) filterArray(key, (value) => !ids.has(String(value.id)));
  filterArray("homeroom.activity", (value) => !demoNames.has(String(value.entityName)));

  try {
    const values = JSON.parse(localStorage.getItem("homeroom.settings") ?? "{}") as Record<string, unknown>;
    if (Array.isArray(values["home.widgets"])) {
      const previous = values["home.widgets"];
      const filtered = previous.filter((item) => item !== "focus" && item !== "today");
      if (previous.length > 0 && filtered.length === 0) delete values["home.widgets"];
      else values["home.widgets"] = filtered;
    }
    localStorage.setItem("homeroom.settings", JSON.stringify(values));
  } catch { /* settings will fall back safely */ }
  localStorage.setItem(versionKey, String(dataVersion));
}
