import { appProvider } from "../../providers/apps/appProvider";
import { documentProvider } from "../../providers/documents/documentProvider";
import { resourceProvider } from "../../providers/library/resourceProvider";
import { mediaProvider } from "../../providers/media/mediaProvider";
import { noteProvider } from "../../providers/notes/noteProvider";
import { projectProvider } from "../../providers/projects/projectProvider";
import { serviceProvider } from "../../providers/services/serviceProvider";
import { taskProvider } from "../../providers/tasks/taskProvider";
import { useRepository } from "../../shared/hooks/useRepository";

export function useHomeSummary() {
  const projectState = useRepository(projectProvider); const projects = projectState.items;
  const taskState = useRepository(taskProvider); const tasks = taskState.items;
  const noteState = useRepository(noteProvider); const notes = noteState.items;
  const documentState = useRepository(documentProvider); const documents = documentState.items;
  const resourceState = useRepository(resourceProvider); const resources = resourceState.items;
  const mediaState = useRepository(mediaProvider); const media = mediaState.items;
  const appState = useRepository(appProvider); const apps = appState.items;
  const serviceState = useRepository(serviceProvider); const services = serviceState.items;
  return {
    activeProjects: projects.filter(({ status }) => status === "active").length,
    openTasks: tasks.filter(({ completed }) => !completed).length,
    notes: notes.length,
    documents: documents.length,
    loading: [projectState, taskState, noteState, documentState, resourceState, mediaState, appState, serviceState].some(({ loading }) => loading),
    total: projects.length + tasks.length + notes.length + documents.length + resources.length + media.length + apps.length + services.length,
  };
}
