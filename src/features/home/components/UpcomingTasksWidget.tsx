import { CalendarDays, Check, ChevronRight } from "lucide-react";
import { taskProvider } from "../../../providers/tasks/taskProvider";
import { appEvents } from "../../../shared/events/eventBus";
import { useRepository } from "../../../shared/hooks/useRepository";
import type { Task } from "../../../shared/models/entities";
import { formatDateKey, localDateKey } from "../../../shared/utils/date";

export function UpcomingTasksWidget() {
  const { items, save } = useRepository(taskProvider); const today = localDateKey();
  const dated = items.filter((task) => !task.completed && task.dueDate).sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
  const agenda = dated.slice(0, 6); const overdue = dated.filter(({ dueDate }) => dueDate! < today).length;
  async function complete(task: Task) { const next = { ...task, completed: true, updatedAt: new Date().toISOString() }; await save(next); appEvents.emit("entity:changed", { action: "completed", entity: next }); }
  return <article className="widget upcoming-widget"><header><div><span className={`eyebrow ${overdue ? "danger-copy" : ""}`}>{overdue ? `${overdue} overdue` : "Next deadlines"}</span><h2>Task agenda</h2></div><button className="text-button" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "/tasks" }))}>All tasks <ChevronRight size={14} /></button></header>
    {agenda.length ? <div className="upcoming-list">{agenda.map((task) => { const due = task.dueDate!; const label = due < today ? `Overdue · ${formatDateKey(due)}` : due === today ? "Today" : formatDateKey(due); return <div key={task.id} className={due < today ? "overdue" : ""}><button className="quick-complete" onClick={() => void complete(task)} aria-label={`Complete ${task.name}`}><Check size={13} /></button><div><strong>{task.name}</strong><span>{task.subtitle ?? "No project"}</span></div><time><CalendarDays size={13} />{label}</time><span className={`priority ${task.priority}`}>{task.priority}</span></div>; })}</div> : <div className="widget-empty"><CalendarDays size={25} /><strong>No scheduled tasks</strong><span>Dated tasks will appear here.</span></div>}
  </article>;
}
