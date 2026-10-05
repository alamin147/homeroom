import type { Entity } from "../../shared/models/entities";
import { appEvents } from "../../shared/events/eventBus";

export interface ActivityItem {
  id: string;
  action: "created" | "updated" | "completed" | "deleted" | "opened" | "checked";
  entityType: Entity["type"];
  entityName: string;
  timestamp: string;
}

const key = "homeroom.activity";
export function listActivity(): ActivityItem[] { return JSON.parse(localStorage.getItem(key) ?? "[]") as ActivityItem[]; }
export function clearActivity() { localStorage.setItem(key, "[]"); }

let installed = false;
export function installActivityRecorder() {
  if (installed) return;
  installed = true;
  appEvents.on("entity:changed", ({ action, entity }) => {
    const next: ActivityItem = { id: crypto.randomUUID(), action, entityType: entity.type, entityName: entity.name, timestamp: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify([next, ...listActivity()].slice(0, 1000)));
    window.dispatchEvent(new Event("activity:changed"));
  });
}
