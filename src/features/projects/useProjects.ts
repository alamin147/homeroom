import { useCallback, useEffect, useState } from "react";
import { projectProvider } from "../../providers/projects/projectProvider";
import { appEvents } from "../../shared/events/eventBus";
import type { Project } from "../../shared/models/entities";
import { toSafeMessage } from "../../shared/models/errors";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const reload = useCallback(async () => {
    try {
      setError(undefined);
      setProjects(await projectProvider.list());
    } catch (reason) {
      setError(toSafeMessage(reason));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  async function save(project: Project) {
    const exists = projects.some(({ id }) => id === project.id);
    await projectProvider.save(project);
    appEvents.emit(exists ? "project:updated" : "project:created", project);
    appEvents.emit("entity:changed", { action: exists ? "updated" : "created", entity: project });
    await reload();
  }

  async function remove(id: string) {
    const project = projects.find((item) => item.id === id);
    await projectProvider.remove(id);
    if (project) appEvents.emit("entity:changed", { action: "deleted", entity: project });
    await reload();
  }

  return { projects, loading, error, reload, save, remove };
}
