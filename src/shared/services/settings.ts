export type SettingKey =
  | "appearance.theme"
  | "appearance.palette"
  | "projects.defaultArea"
  | "documents.defaultKind"
  | "tasks.defaultPriority"
  | "home.widgets";

const key = "homeroom.settings";

export const settings = {
  get<T>(name: SettingKey, fallback: T): T {
    const values = JSON.parse(localStorage.getItem(key) ?? "{}") as Record<string, T>;
    return values[name] ?? fallback;
  },
  set<T>(name: SettingKey, value: T) {
    const values = JSON.parse(localStorage.getItem(key) ?? "{}") as Record<string, unknown>;
    localStorage.setItem(key, JSON.stringify({ ...values, [name]: value }));
  },
};
