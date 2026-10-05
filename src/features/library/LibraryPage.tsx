import { BookMarked, ExternalLink, FolderInput, Heart, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { resourceProvider } from "../../providers/library/resourceProvider";
import { EmptyState } from "../../shared/components/EmptyState";
import { Modal } from "../../shared/components/Modal";
import { appEvents } from "../../shared/events/eventBus";
import { useRepository } from "../../shared/hooks/useRepository";
import type { Resource } from "../../shared/models/entities";
import { createId } from "../../shared/utils/id";
import { chooseAndScan, configuredRoots, openLocalPath, scanConfigured, type LocalFile } from "../../providers/files/localFileProvider";

export default function LibraryPage() {
  const { items, save, saveMany, remove } = useRepository(resourceProvider); const [query, setQuery] = useState(""); const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [editing, setEditing] = useState<Resource>();
  const visible = useMemo(() => items.filter((item) => [item.name, item.category, ...item.tags].join(" ").toLowerCase().includes(query.toLowerCase())).sort((a, b) => Number(b.favorite) - Number(a.favorite)), [items, query]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const resource: Resource = { ...editing, id: editing?.id ?? createId("resource"), type: "resource", name: String(data.get("name")), subtitle: String(data.get("subtitle")), kind: editing?.kind ?? "link", url: String(data.get("url")) || undefined, category: String(data.get("category")), favorite: editing?.favorite ?? false, tags: String(data.get("tags")).split(",").map((tag) => tag.trim()).filter(Boolean), createdAt: editing?.createdAt ?? new Date().toISOString() }; await save(resource); appEvents.emit("entity:changed", { action: editing ? "updated" : "created", entity: resource }); setCreating(false); setEditing(undefined); }
  async function favorite(item: Resource) { const next = { ...item, favorite: !item.favorite }; await save(next); appEvents.emit("entity:changed", { action: "updated", entity: next }); }
  function open(item: Resource) { if (item.path) void openLocalPath(item.path); else if (item.url) window.open(item.url, "_blank", "noopener,noreferrer"); appEvents.emit("entity:changed", { action: "opened", entity: item }); }
  async function discard(item: Resource) { await remove(item.id); appEvents.emit("entity:changed", { action: "deleted", entity: item }); }
  async function syncFiles(files: LocalFile[]) {
    const imported: Resource[] = files.map((file) => { const existing = items.find(({ path }) => path === file.path); return existing ? { ...existing, name: file.name, subtitle: `${file.extension.toUpperCase()} · Local book` } : { id: createId("resource"), type: "resource", name: file.name, subtitle: `${file.extension.toUpperCase()} · Local book`, kind: "book", path: file.path, category: "Books", favorite: false, tags: ["local", "book"], createdAt: new Date().toISOString() }; });
    await saveMany(imported);
    imported.forEach((resource) => appEvents.emit("entity:changed", { action: items.some(({ id }) => id === resource.id) ? "updated" : "created", entity: resource }));
  }
  async function importBooks(refresh = false) {
    setImporting(true);
    try {
      await syncFiles(refresh ? await scanConfigured("book") : (await chooseAndScan("book")).files);
    } catch (error) { window.alert(error instanceof Error ? error.message : "Unable to import books."); }
    finally { setImporting(false); }
  }
  return <div className="page"><div className="page-heading"><div><span className="eyebrow">Useful things, retrievable</span><h1>Library</h1><p>Books, bookmarks, and references kept with enough context to find again.</p></div><div className="heading-actions">{configuredRoots("book").length > 0 && <button className="button ghost" onClick={() => void importBooks(true)} disabled={importing}><RefreshCw size={16} />Refresh</button>}<button className="button ghost" onClick={() => void importBooks()} disabled={importing}><FolderInput size={17} />{importing ? "Scanning…" : "Add book folder"}</button><button className="button primary" onClick={() => setCreating(true)}><Plus size={17} />Add resource</button></div></div><div className="toolbar"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your library" /></label></div>
    {visible.length ? <div className="resource-grid">{visible.map((item) => <article className="resource-card" key={item.id}><header><span className="resource-domain">{item.path ? `${item.kind} · local file` : item.url ? new URL(item.url).hostname.replace("www.", "") : "resource"}</span><button className={`icon-button ${item.favorite ? "selected" : ""}`} onClick={() => void favorite(item)} aria-label={`${item.favorite ? "Remove" : "Add"} ${item.name} ${item.favorite ? "from" : "to"} favorites`}><Heart size={16} fill={item.favorite ? "currentColor" : "none"} /></button></header><div><span className="eyebrow">{item.category}</span><h3>{item.name}</h3><p>{item.subtitle}</p></div><footer><button className="text-button" onClick={() => open(item)}>Open <ExternalLink size={14} /></button><div><button className="icon-button" onClick={() => setEditing(item)} aria-label={`Edit ${item.name}`}><Pencil size={15} /></button><button className="icon-button" onClick={() => void discard(item)} aria-label={`Delete ${item.name}`}><Trash2 size={15} /></button></div></footer></article>)}</div> : <EmptyState icon={<BookMarked />} title="Your library is clear" text="Save a useful link or import a book folder." />}
    {(creating || editing) && <Modal title={editing ? "Edit resource" : "Resource"} onClose={() => { setCreating(false); setEditing(undefined); }}><form className="stack-form" onSubmit={(event) => void submit(event)}><label>Name<input name="name" required autoFocus defaultValue={editing?.name} placeholder="A resource worth keeping" /></label><label>URL<input name="url" type="url" required={!editing?.path} defaultValue={editing?.url} placeholder="https://…" /></label><label>Why keep it?<input name="subtitle" defaultValue={editing?.subtitle} placeholder="A short reminder" /></label><div className="form-row"><label>Category<input name="category" required defaultValue={editing?.category} placeholder="Design" /></label><label>Tags<input name="tags" defaultValue={editing?.tags.join(", ")} placeholder="work, reference" /></label></div><footer><button type="button" className="button ghost" onClick={() => { setCreating(false); setEditing(undefined); }}>Cancel</button><button className="button primary">{editing ? "Save changes" : "Add resource"}</button></footer></form></Modal>}
  </div>;
}
