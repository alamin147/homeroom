import { Check, Circle, ListTodo, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { projectProvider } from "../../providers/projects/projectProvider";
import { taskProvider } from "../../providers/tasks/taskProvider";
import { EmptyState } from "../../shared/components/EmptyState";
import { Modal } from "../../shared/components/Modal";
import { appEvents } from "../../shared/events/eventBus";
import { useRepository } from "../../shared/hooks/useRepository";
import type { Project, Task, TaskPriority } from "../../shared/models/entities";
import { createId } from "../../shared/utils/id";
import { settings } from "../../shared/services/settings";
import { formatDateKey, localDateKey } from "../../shared/utils/date";

type Filter = "open" | "today" | "completed";

export default function TasksPage() {
  const { items: tasks, save, remove } = useRepository(taskProvider);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<Filter>("open");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Task>();
  useEffect(() => { void projectProvider.list().then(setProjects); }, []);
  const today = localDateKey();
  const visible = useMemo(() => tasks.filter((task) => filter === "completed" ? task.completed : filter === "today" ? !task.completed && task.dueDate === today : !task.completed).sort((a, b) => filter === "completed" ? b.updatedAt.localeCompare(a.updatedAt) : (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999")), [filter, tasks, today]);

  async function toggle(task: Task) {
    const next = { ...task, completed: !task.completed, updatedAt: new Date().toISOString() };
    await save(next); appEvents.emit("entity:changed", { action: next.completed ? "completed" : "updated", entity: next });
  }
  async function discard(task: Task) { await remove(task.id); appEvents.emit("entity:changed", { action: "deleted", entity: task }); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const now = new Date().toISOString();
    const task: Task = { ...editing, id: editing?.id ?? createId("task"), type: "task", name: String(data.get("name")), subtitle: projects.find(({ id }) => id === data.get("projectId"))?.name, tags: editing?.tags ?? [], completed: editing?.completed ?? false, priority: String(data.get("priority")) as TaskPriority, dueDate: String(data.get("dueDate")) || undefined, projectId: String(data.get("projectId")) || undefined, createdAt: editing?.createdAt ?? now, updatedAt: now };
    await save(task); appEvents.emit("entity:changed", { action: editing ? "updated" : "created", entity: task }); setCreating(false); setEditing(undefined);
  }

  return <div className="page"><div className="page-heading"><div><span className="eyebrow">Attention, made visible</span><h1>Tasks</h1><p>A focused list for the next concrete actions across your life.</p></div><button className="button primary" onClick={() => setCreating(true)}><Plus size={17} />New task</button></div>
    <div className="segmented">{(["open", "today", "completed"] as const).map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}<span>{tasks.filter((task) => item === "completed" ? task.completed : item === "today" ? !task.completed && task.dueDate === today : !task.completed).length}</span></button>)}</div>
    {visible.length ? <div className="task-list">{visible.map((task) => <article className={`task-row ${task.completed ? "done" : ""}`} key={task.id}><button className="task-check" onClick={() => void toggle(task)} aria-label={`${task.completed ? "Reopen" : "Complete"} ${task.name}`}>{task.completed ? <Check size={16} /> : <Circle size={17} />}</button><div><h3>{task.name}</h3><span>{task.subtitle ?? "No project"}{task.dueDate ? ` · ${task.dueDate === today ? "Today" : formatDateKey(task.dueDate)}` : ""}</span></div><span className={`priority ${task.priority}`}>{task.priority}</span><button className="icon-button" onClick={() => setEditing(task)} aria-label={`Edit ${task.name}`}><Pencil size={16} /></button><button className="icon-button" onClick={() => void discard(task)} aria-label={`Delete ${task.name}`}><Trash2 size={16} /></button></article>)}</div> : <EmptyState icon={<ListTodo />} title={`No ${filter} tasks`} text="Your attention is clear here." />}
    {(creating || editing) && <Modal title={editing ? "Edit task" : "Task"} onClose={() => { setCreating(false); setEditing(undefined); }}><form className="stack-form" onSubmit={(event) => void submit(event)}><label>What needs doing?<input name="name" required autoFocus defaultValue={editing?.name} placeholder="Book the annual checkup" /></label><div className="form-row"><label>Priority<select name="priority" defaultValue={editing?.priority ?? settings.get("tasks.defaultPriority", "medium")}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Due date<input type="date" name="dueDate" defaultValue={editing?.dueDate} /></label></div><label>Project<select name="projectId" defaultValue={editing?.projectId ?? ""}><option value="">No project</option>{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select></label><footer><button type="button" className="button ghost" onClick={() => { setCreating(false); setEditing(undefined); }}>Cancel</button><button className="button primary">{editing ? "Save changes" : "Create task"}</button></footer></form></Modal>}
  </div>;
}
