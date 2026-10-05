import { FolderInput, FolderKanban, Plus, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "../../shared/components/EmptyState";
import { Modal } from "../../shared/components/Modal";
import type { Project, ProjectStatus } from "../../shared/models/entities";
import { ProjectCard } from "./components/ProjectCard";
import { ProjectForm } from "./components/ProjectForm";
import { useProjects } from "./useProjects";
import { chooseAndScanProjects, configuredRoots, openLocalPath, scanConfiguredProjects, type ProjectDirectory } from "../../providers/files/localFileProvider";
import { projectProvider } from "../../providers/projects/projectProvider";
import { appEvents } from "../../shared/events/eventBus";
import { createId } from "../../shared/utils/id";

const statuses: Array<"all" | ProjectStatus> = ["all", "planned", "active", "on-hold", "completed"];

export default function ProjectsPage() {
  const { projects, loading, error, reload, save, remove } = useProjects();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Project>();
  const [importing, setImporting] = useState(false);
  const visible = useMemo(() => projects.filter((project) =>
    (status === "all" || project.status === status) &&
    [project.name, project.description, project.area, ...project.tags].join(" ").toLowerCase().includes(query.toLowerCase()),
  ), [projects, query, status]);

  async function syncFolders(folders: ProjectDirectory[]) {
    const now = new Date().toISOString();
    const imported: Project[] = folders.map((folder) => { const existing = projects.find(({ path }) => path === folder.path); return existing ? { ...existing, name: folder.name, updatedAt: now } : { id: createId("project"), type: "project", name: folder.name, description: "Imported local project folder.", area: "Local", status: "active", progress: 0, path: folder.path, tags: ["local"], createdAt: now, updatedAt: now }; });
    await projectProvider.saveMany(imported);
    imported.forEach((project) => appEvents.emit("entity:changed", { action: projects.some(({ id }) => id === project.id) ? "updated" : "created", entity: project }));
    await reload();
  }

  async function importFolder(refresh = false) {
    setImporting(true);
    try {
      await syncFolders(refresh ? await scanConfiguredProjects() : (await chooseAndScanProjects()).projects);
    } catch (error) { window.alert(error instanceof Error ? error.message : "Unable to import project folders."); }
    finally { setImporting(false); }
  }

  return <div className="page">
    <div className="page-heading"><div><span className="eyebrow">Your commitments</span><h1>Projects</h1><p>Shape meaningful outcomes without losing the everyday details.</p></div><div className="heading-actions">{configuredRoots("project").length > 0 && <button className="button ghost" onClick={() => void importFolder(true)} disabled={importing}><RefreshCw size={16} />Refresh</button>}<button className="button ghost" onClick={() => void importFolder()} disabled={importing}><FolderInput size={17} />{importing ? "Scanning…" : "Add folder"}</button><button className="button primary" onClick={() => setCreating(true)}><Plus size={17} />New project</button></div></div>
    <div className="toolbar"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" /></label><div className="filter-pills">{statuses.map((item) => <button className={status === item ? "active" : ""} key={item} onClick={() => setStatus(item)}>{item === "all" ? "All" : item.replace("-", " ")}</button>)}</div></div>
    {loading ? <div className="loading">Gathering your projects…</div> : error ? <div className="error-state"><strong>{error}</strong><button onClick={() => void reload()}>Try again</button></div> : visible.length ? <div className="project-grid">{visible.map((project) => <ProjectCard key={project.id} project={project} onEdit={setEditing} onOpen={(item) => item.path && void openLocalPath(item.path)} onDelete={(id) => void remove(id)} />)}</div> : <EmptyState icon={<FolderKanban />} title="No projects found" text="Adjust the filters or create a project for your next outcome." />}
    {creating && <Modal title="Project" onClose={() => setCreating(false)}><ProjectForm onCancel={() => setCreating(false)} onSave={async (project) => { await save(project); setCreating(false); }} /></Modal>}
    {editing && <Modal title="Edit project" onClose={() => setEditing(undefined)}><ProjectForm initial={editing} onCancel={() => setEditing(undefined)} onSave={async (project) => { await save(project); setEditing(undefined); }} /></Modal>}
  </div>;
}
