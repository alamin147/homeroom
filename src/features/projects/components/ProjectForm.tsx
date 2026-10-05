import { useState, type FormEvent } from "react";
import type { Project, ProjectStatus } from "../../../shared/models/entities";
import { settings } from "../../../shared/services/settings";
import { createId } from "../../../shared/utils/id";

export function ProjectForm({ initial, onSave, onCancel }: { initial?: Project; onSave(project: Project): Promise<void>; onCancel(): void }) {
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    const data = new FormData(event.currentTarget); const now = new Date().toISOString();
    await onSave({
      id: initial?.id ?? createId("project"), type: "project", name: String(data.get("name")),
      subtitle: String(data.get("subtitle") ?? ""), description: String(data.get("description")),
      area: String(data.get("area")), status: String(data.get("status")) as ProjectStatus,
      progress: Number(data.get("progress") ?? 0), dueDate: String(data.get("dueDate") ?? "") || undefined,
      path: initial?.path,
      tags: String(data.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
      createdAt: initial?.createdAt ?? now, updatedAt: now,
    });
    setSaving(false);
  }

  return <form className="stack-form" onSubmit={(event) => void submit(event)}>
    <label>Project name<input name="name" required autoFocus defaultValue={initial?.name} placeholder="Plan the balcony garden" /></label>
    <label>Short purpose<input name="subtitle" defaultValue={initial?.subtitle} placeholder="Why this matters" /></label>
    <label>Description<textarea name="description" required rows={3} defaultValue={initial?.description} placeholder="What outcome are you aiming for?" /></label>
    <div className="form-row"><label>Area<input name="area" required defaultValue={initial?.area ?? settings.get("projects.defaultArea", "Personal")} /></label><label>Status<select name="status" defaultValue={initial?.status ?? "planned"}><option value="planned">Planned</option><option value="active">Active</option><option value="on-hold">On hold</option><option value="completed">Completed</option></select></label></div>
    <div className="form-row"><label>Progress<input name="progress" type="number" min="0" max="100" defaultValue={initial?.progress ?? 0} /></label><label>Due date<input name="dueDate" type="date" defaultValue={initial?.dueDate} /></label></div>
    <label>Tags<input name="tags" defaultValue={initial?.tags.join(", ")} placeholder="garden, weekend" /></label>
    <footer><button type="button" className="button ghost" onClick={onCancel}>Cancel</button><button className="button primary" disabled={saving}>{saving ? "Saving…" : initial ? "Update project" : "Create project"}</button></footer>
  </form>;
}
