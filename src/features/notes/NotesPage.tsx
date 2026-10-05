import { BookOpen, ExternalLink, FolderInput, Lightbulb, Pin, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { noteProvider } from "../../providers/notes/noteProvider";
import { EmptyState } from "../../shared/components/EmptyState";
import { Modal } from "../../shared/components/Modal";
import { appEvents } from "../../shared/events/eventBus";
import { useRepository } from "../../shared/hooks/useRepository";
import type { Note } from "../../shared/models/entities";
import { createId } from "../../shared/utils/id";
import { chooseAndScan, configuredRoots, openLocalPath, readLocalText, scanConfigured, type LocalFile } from "../../providers/files/localFileProvider";
import { ReaderModal, readerFormat, type ReaderSource } from "../../shared/components/reader/ReaderModal";

export default function NotesPage() {
  const { items: notes, save, saveMany, remove } = useRepository(noteProvider);
  const [query, setQuery] = useState(""); const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [reader, setReader] = useState<ReaderSource>();
  const visible = useMemo(() => notes.filter((note) => [note.name, note.content, ...note.tags].join(" ").toLowerCase().includes(query.toLowerCase())).sort((a, b) => Number(b.pinned) - Number(a.pinned)), [notes, query]);
  async function create(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const now = new Date().toISOString(); const note: Note = { id: createId("note"), type: "note", name: String(data.get("name")), content: String(data.get("content")), pinned: false, color: String(data.get("color")) as Note["color"], tags: String(data.get("tags")).split(",").map((tag) => tag.trim()).filter(Boolean), createdAt: now, updatedAt: now }; await save(note); appEvents.emit("entity:changed", { action: "created", entity: note }); setCreating(false); }
  async function pin(note: Note) { const next = { ...note, pinned: !note.pinned, updatedAt: new Date().toISOString() }; await save(next); appEvents.emit("entity:changed", { action: "updated", entity: next }); }
  async function discard(note: Note) { await remove(note.id); appEvents.emit("entity:changed", { action: "deleted", entity: note }); }
  async function syncFiles(files: LocalFile[]) {
    const imported = await Promise.all(files.map(async (file): Promise<Note> => { const existing = notes.find(({ path }) => path === file.path); const content = await readLocalText(file.path); const timestamp = new Date((file.modifiedAt ?? Date.now() / 1000) * 1000).toISOString(); return existing ? { ...existing, name: file.name, content, updatedAt: timestamp } : { id: createId("note"), type: "note", name: file.name, content, pinned: false, color: "sage", path: file.path, tags: ["local"], createdAt: timestamp, updatedAt: timestamp }; }));
    await saveMany(imported);
    imported.forEach((note) => appEvents.emit("entity:changed", { action: notes.some(({ id }) => id === note.id) ? "updated" : "created", entity: note }));
  }

  async function importFolder(refresh = false) {
    setImporting(true);
    try {
      await syncFiles(refresh ? await scanConfigured("note") : (await chooseAndScan("note")).files);
    } catch (error) { window.alert(error instanceof Error ? error.message : "Unable to import notes."); }
    finally { setImporting(false); }
  }
  return <div className="page"><div className="page-heading"><div><span className="eyebrow">Capture before it disappears</span><h1>Notes</h1><p>Loose thoughts, reminders, and small pieces of context.</p></div><div className="heading-actions">{configuredRoots("note").length > 0 && <button className="button ghost" onClick={() => void importFolder(true)} disabled={importing}><RefreshCw size={16} />Refresh</button>}<button className="button ghost" onClick={() => void importFolder()} disabled={importing}><FolderInput size={17} />{importing ? "Reading…" : "Add folder"}</button><button className="button primary" onClick={() => setCreating(true)}><Plus size={17} />New note</button></div></div><div className="toolbar"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes" /></label></div>
    {visible.length ? <div className="notes-grid">{visible.map((note) => <article key={note.id} className={`note-card ${note.color}`}><header><span>{note.path ? "Local file" : new Date(note.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span><div><button className="icon-button" onClick={() => setReader({ title: note.name, path: note.path, content: note.content, format: readerFormat(note.path) ?? "markdown" })} aria-label={`Read ${note.name}`}><BookOpen size={15} /></button>{note.path && <button className="icon-button" onClick={() => void openLocalPath(note.path!)} aria-label={`Open ${note.name} in default app`}><ExternalLink size={15} /></button>}<button className={`icon-button ${note.pinned ? "selected" : ""}`} onClick={() => void pin(note)}><Pin size={15} /></button><button className="icon-button" onClick={() => void discard(note)}><Trash2 size={15} /></button></div></header><h3>{note.name}</h3><p>{note.content}</p><footer>{note.tags.map((tag) => <span key={tag}>#{tag}</span>)}</footer></article>)}</div> : <EmptyState icon={<Lightbulb />} title="No notes found" text="Capture an idea without deciding where it belongs yet." />}
    {creating && <Modal title="Note" onClose={() => setCreating(false)}><form className="stack-form" onSubmit={(event) => void create(event)}><label>Title<input name="name" required autoFocus placeholder="A thought worth keeping" /></label><label>Note<textarea name="content" required rows={7} placeholder="Write freely…" /></label><div className="form-row"><label>Color<select name="color"><option value="sand">Sand</option><option value="sage">Sage</option><option value="lavender">Lavender</option><option value="clay">Clay</option></select></label><label>Tags<input name="tags" placeholder="idea, home" /></label></div><footer><button type="button" className="button ghost" onClick={() => setCreating(false)}>Cancel</button><button className="button primary">Save note</button></footer></form></Modal>}
    {reader && <ReaderModal source={reader} onClose={() => setReader(undefined)} />}
  </div>;
}
