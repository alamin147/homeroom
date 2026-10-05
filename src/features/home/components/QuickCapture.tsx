import { CheckSquare, NotebookPen } from "lucide-react";
import { useState, type FormEvent } from "react";
import { noteProvider } from "../../../providers/notes/noteProvider";
import { taskProvider } from "../../../providers/tasks/taskProvider";
import { Modal } from "../../../shared/components/Modal";
import { appEvents } from "../../../shared/events/eventBus";
import type { Note, Task, TaskPriority } from "../../../shared/models/entities";
import { settings } from "../../../shared/services/settings";
import { createId } from "../../../shared/utils/id";

export function QuickCapture({ onClose }: { onClose(): void }) {
  const [kind, setKind] = useState<"task" | "note">("task");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    const data = new FormData(event.currentTarget); const now = new Date().toISOString();
    if (kind === "task") {
      const task: Task = { id: createId("task"), type: "task", name: String(data.get("name")), tags: [], completed: false, priority: String(data.get("priority")) as TaskPriority, dueDate: String(data.get("dueDate")) || undefined, createdAt: now, updatedAt: now };
      await taskProvider.save(task); appEvents.emit("entity:changed", { action: "created", entity: task });
    } else {
      const note: Note = { id: createId("note"), type: "note", name: String(data.get("name")), content: String(data.get("content")), pinned: false, color: "sand", tags: [], createdAt: now, updatedAt: now };
      await noteProvider.save(note); appEvents.emit("entity:changed", { action: "created", entity: note });
    }
    setSaving(false); onClose();
  }

  return <Modal title="Quick capture" onClose={onClose}>
    <div className="capture-tabs"><button className={kind === "task" ? "active" : ""} onClick={() => setKind("task")}><CheckSquare size={16} />Task</button><button className={kind === "note" ? "active" : ""} onClick={() => setKind("note")}><NotebookPen size={16} />Note</button></div>
    <form className="stack-form" key={kind} onSubmit={(event) => void submit(event)}>
      <label>{kind === "task" ? "What needs doing?" : "Note title"}<input name="name" required autoFocus placeholder={kind === "task" ? "Call the electrician" : "Something worth remembering"} /></label>
      {kind === "task" ? <div className="form-row"><label>Due date<input name="dueDate" type="date" /></label><label>Priority<select name="priority" defaultValue={settings.get("tasks.defaultPriority", "medium")}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label></div> : <label>Thought<textarea name="content" required rows={6} placeholder="Capture the context while it is fresh…" /></label>}
      <footer><button type="button" className="button ghost" onClick={onClose}>Cancel</button><button className="button primary" disabled={saving}>{saving ? "Saving…" : `Add ${kind}`}</button></footer>
    </form>
  </Modal>;
}
