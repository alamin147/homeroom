import { useEffect, useState, type FormEvent } from "react";
import { projectProvider } from "../../../providers/projects/projectProvider";
import type { Document, DocumentKind, Project } from "../../../shared/models/entities";
import { createId } from "../../../shared/utils/id";
import { settings } from "../../../shared/services/settings";

export function DocumentForm({ onSave, onCancel }: { onSave(document: Document): Promise<void>; onCancel(): void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => { void projectProvider.list().then(setProjects); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    const data = new FormData(event.currentTarget); const now = new Date().toISOString();
    await onSave({
      id: createId("document"), type: "document", name: String(data.get("name")),
      subtitle: String(data.get("subtitle") ?? ""), summary: String(data.get("summary")),
      kind: String(data.get("kind")) as DocumentKind,
      projectId: String(data.get("projectId") ?? "") || undefined,
      tags: String(data.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
      createdAt: now, updatedAt: now,
    });
    setSaving(false);
  }

  return <form className="stack-form" onSubmit={(event) => void submit(event)}>
    <label>Title<input name="name" required autoFocus placeholder="Kitchen renovation notes" /></label>
    <label>Short context<input name="subtitle" placeholder="What this document is for" /></label>
    <label>Summary<textarea name="summary" required rows={4} placeholder="Capture the useful details…" /></label>
    <div className="form-row"><label>Kind<select name="kind" defaultValue={settings.get("documents.defaultKind", "note")}><option value="note">Note</option><option value="reference">Reference</option><option value="checklist">Checklist</option></select></label><label>Related project<select name="projectId"><option value="">None</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label></div>
    <label>Tags<input name="tags" placeholder="research, home" /></label>
    <footer><button type="button" className="button ghost" onClick={onCancel}>Cancel</button><button className="button primary" disabled={saving}>{saving ? "Saving…" : "Create document"}</button></footer>
  </form>;
}
