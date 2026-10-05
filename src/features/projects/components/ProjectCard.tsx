import { Calendar, FolderOpen, Pencil, Trash2 } from "lucide-react";
import type { Project } from "../../../shared/models/entities";

const statusLabel = { planned: "Planned", active: "Active", "on-hold": "On hold", completed: "Completed" };

export function ProjectCard({ project, onEdit, onOpen, onDelete }: { project: Project; onEdit(project: Project): void; onOpen(project: Project): void; onDelete(id: string): void }) {
  return <article className="project-card">
    <header><span className={`status ${project.status}`}>{statusLabel[project.status]}</span><div className="card-actions">{project.path && <button className="icon-button" aria-label={`Open ${project.name} folder`} onClick={() => onOpen(project)}><FolderOpen size={15} /></button>}<button className="icon-button" aria-label={`Edit ${project.name}`} onClick={() => onEdit(project)}><Pencil size={15} /></button><button className="icon-button" aria-label={`Delete ${project.name}`} onClick={() => onDelete(project.id)}><Trash2 size={15} /></button></div></header>
    <div><span className="eyebrow">{project.area}</span><h3>{project.name}</h3><p>{project.description}</p></div>
    <div className="tags">{project.path && <span className="local-badge">Local folder</span>}{project.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
    <footer><div className="progress"><span style={{ width: `${project.progress}%` }} /></div><span>{project.progress}%</span>{project.dueDate && <span className="due"><Calendar size={14} />{new Date(`${project.dueDate}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>}</footer>
  </article>;
}
