import { lazy } from "react";
import { Activity, BookMarked, CheckSquare, FileText, FolderKanban, Grid2X2, House, Info, Library, NotebookPen, Server, Settings } from "lucide-react";
import { appProvider } from "../providers/apps/appProvider";
import { documentProvider } from "../providers/documents/documentProvider";
import { resourceProvider } from "../providers/library/resourceProvider";
import { mediaProvider } from "../providers/media/mediaProvider";
import { noteProvider } from "../providers/notes/noteProvider";
import { projectProvider } from "../providers/projects/projectProvider";
import { serviceProvider } from "../providers/services/serviceProvider";
import { taskProvider } from "../providers/tasks/taskProvider";
import type { Entity } from "../shared/models/entities";
import type { StorageRepository } from "../shared/services/storage";
import { appEvents } from "../shared/events/eventBus";
import { openLocalPath } from "../providers/files/localFileProvider";
import { actionRegistry } from "./actionRegistry";
import { routeRegistry } from "./routeRegistry";
import { searchRegistry } from "./searchRegistry";

let registered = false;

export function registerFeatures() {
  if (registered) return;
  registered = true;

  routeRegistry.register({ id: "home", title: "Home", path: "/", order: 10, icon: House, component: lazy(() => import("../features/home")) });
  routeRegistry.register({ id: "projects", title: "Projects", path: "/projects", order: 20, icon: FolderKanban, component: lazy(() => import("../features/projects")) });
  routeRegistry.register({ id: "tasks", title: "Tasks", path: "/tasks", order: 30, icon: CheckSquare, component: lazy(() => import("../features/tasks")) });
  routeRegistry.register({ id: "notes", title: "Notes", path: "/notes", order: 40, icon: NotebookPen, component: lazy(() => import("../features/notes")) });
  routeRegistry.register({ id: "documents", title: "Documents", path: "/documents", order: 50, icon: FileText, component: lazy(() => import("../features/documents")) });
  routeRegistry.register({ id: "library", title: "Library", path: "/library", order: 60, icon: BookMarked, component: lazy(() => import("../features/library")) });
  routeRegistry.register({ id: "media", title: "Media", path: "/media", order: 70, icon: Library, component: lazy(() => import("../features/media")) });
  routeRegistry.register({ id: "apps", title: "Apps", path: "/apps", order: 80, icon: Grid2X2, component: lazy(() => import("../features/apps")) });
  routeRegistry.register({ id: "services", title: "Services", path: "/services", order: 90, icon: Server, component: lazy(() => import("../features/services")) });
  routeRegistry.register({ id: "activity", title: "Activity", path: "/activity", order: 100, icon: Activity, component: lazy(() => import("../features/activity")) });
  routeRegistry.register({ id: "settings", title: "Settings", path: "/settings", order: 110, icon: Settings, component: lazy(() => import("../features/settings")) });
  routeRegistry.register({ id: "about", title: "About", path: "/about", order: 120, icon: Info, component: lazy(() => import("../features/about")) });

  searchRegistry.register({
    id: "projects",
    async search(query) {
      const needle = query.toLowerCase();
      return (await projectProvider.list())
        .filter((item) => [item.name, item.description, item.area, ...item.tags].join(" ").toLowerCase().includes(needle))
        .map((entity) => ({ id: entity.id, title: entity.name, detail: `Project · ${entity.area}`, path: "/projects", entity }));
    },
  });
  const registerSimpleSearch = <T extends Entity>(id: string, path: string, label: string, provider: StorageRepository<T>) => searchRegistry.register({
    id,
    async search(query) {
      const needle = query.toLowerCase();
      return (await provider.list())
        .filter((item) => [item.name, item.subtitle, ...item.tags].join(" ").toLowerCase().includes(needle))
        .map((entity) => ({ id: entity.id, title: entity.name, detail: `${label}${entity.subtitle ? ` · ${entity.subtitle}` : ""}`, path, entity }));
    },
  });
  registerSimpleSearch("tasks", "/tasks", "Task", taskProvider);
  registerSimpleSearch("notes", "/notes", "Note", noteProvider);
  registerSimpleSearch("library", "/library", "Library", resourceProvider);
  registerSimpleSearch("media", "/media", "Media", mediaProvider);
  registerSimpleSearch("apps", "/apps", "App", appProvider);
  registerSimpleSearch("services", "/services", "Service", serviceProvider);
  searchRegistry.register({
    id: "documents",
    async search(query) {
      const needle = query.toLowerCase();
      return (await documentProvider.list())
        .filter((item) => [item.name, item.summary, ...item.tags].join(" ").toLowerCase().includes(needle))
        .map((entity) => ({ id: entity.id, title: entity.name, detail: `Document · ${entity.kind}`, path: "/documents", entity }));
    },
  });

  actionRegistry.register({
    id: "copy-name",
    label: "Copy name",
    supports: () => true,
    async execute(entity) {
      await navigator.clipboard.writeText(entity.name);
    },
  });
  actionRegistry.register({
    id: "open-link",
    label: "Open",
    supports: (entity) => ("path" in entity && Boolean(entity.path)) || entity.type === "resource" || entity.type === "app" || entity.type === "service",
    async execute(entity) {
      if ("path" in entity && entity.path) await openLocalPath(entity.path);
      else if ("url" in entity && entity.url) window.open(entity.url, "_blank", "noopener,noreferrer");
      appEvents.emit("entity:changed", { action: "opened", entity });
    },
  });
  actionRegistry.register({
    id: "complete-task",
    label: "Complete",
    supports: (entity) => entity.type === "task" && !entity.completed,
    async execute(entity) {
      if (entity.type !== "task") return;
      const next = { ...entity, completed: true, updatedAt: new Date().toISOString() };
      await taskProvider.save(next);
      appEvents.emit("entity:changed", { action: "completed", entity: next });
    },
  });
  actionRegistry.register({
    id: "toggle-favorite",
    label: "Favorite",
    supports: (entity) => (entity.type === "resource" || entity.type === "app") && !entity.favorite,
    async execute(entity) {
      if (entity.type === "resource") {
        const next = { ...entity, favorite: true };
        await resourceProvider.save(next);
        appEvents.emit("entity:changed", { action: "updated", entity: next });
      }
      if (entity.type === "app") {
        const next = { ...entity, favorite: true };
        await appProvider.save(next);
        appEvents.emit("entity:changed", { action: "updated", entity: next });
      }
    },
  });
}
