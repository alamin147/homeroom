import { ExternalLink, Heart, LayoutGrid, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { appProvider } from "../../providers/apps/appProvider";
import { EmptyState } from "../../shared/components/EmptyState";
import { Modal } from "../../shared/components/Modal";
import { appEvents } from "../../shared/events/eventBus";
import { useRepository } from "../../shared/hooks/useRepository";
import type { AppLink } from "../../shared/models/entities";
import { createId } from "../../shared/utils/id";

export default function AppsPage() {
  const { items, save, remove } = useRepository(appProvider); const [query, setQuery] = useState(""); const [creating, setCreating] = useState(false);
  const visible = useMemo(() => items.filter((item) => [item.name, item.category, ...item.tags].join(" ").toLowerCase().includes(query.toLowerCase())).sort((a, b) => Number(b.favorite) - Number(a.favorite)), [items, query]);
  async function create(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const app: AppLink = { id: createId("app"), type: "app", name: String(data.get("name")), subtitle: String(data.get("subtitle")), url: String(data.get("url")), category: String(data.get("category")), favorite: false, color: String(data.get("color")), tags: [] }; await save(app); appEvents.emit("entity:changed", { action: "created", entity: app }); setCreating(false); }
  async function favorite(app: AppLink) { const next = { ...app, favorite: !app.favorite }; await save(next); appEvents.emit("entity:changed", { action: "updated", entity: next }); }
  function launch(app: AppLink) { window.open(app.url, "_blank", "noopener,noreferrer"); appEvents.emit("entity:changed", { action: "opened", entity: app }); }
  async function discard(app: AppLink) { await remove(app.id); appEvents.emit("entity:changed", { action: "deleted", entity: app }); }
  return <div className="page"><div className="page-heading"><div><span className="eyebrow">Your launchpad</span><h1>Apps</h1><p>One calm place for the tools you use across work and home.</p></div><button className="button primary" onClick={() => setCreating(true)}><Plus size={17} />Add app</button></div><div className="toolbar"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an app" /></label></div>
    {visible.length ? <div className="apps-grid">{visible.map((app) => <article className="app-card" key={app.id}><header><button className="app-icon" style={{ background: app.color }} onClick={() => launch(app)}>{app.name.slice(0, 1).toUpperCase()}</button><div><h3>{app.name}</h3><p>{app.subtitle}</p></div><button className={`icon-button ${app.favorite ? "selected" : ""}`} onClick={() => void favorite(app)}><Heart size={15} fill={app.favorite ? "currentColor" : "none"} /></button></header><footer><span>{app.category}</span><div><button className="icon-button" onClick={() => launch(app)}><ExternalLink size={15} /></button><button className="icon-button" onClick={() => void discard(app)}><Trash2 size={15} /></button></div></footer></article>)}</div> : <EmptyState icon={<LayoutGrid />} title="No apps found" text="Add web tools now; native launchers can use the same provider later." />}
    {creating && <Modal title="App shortcut" onClose={() => setCreating(false)}><form className="stack-form" onSubmit={(event) => void create(event)}><label>Name<input name="name" required autoFocus /></label><label>URL<input name="url" type="url" required placeholder="https://…" /></label><label>Description<input name="subtitle" placeholder="What you use it for" /></label><div className="form-row"><label>Category<input name="category" required placeholder="Create" /></label><label>Color<input name="color" type="color" defaultValue="#315d4b" /></label></div><footer><button type="button" className="button ghost" onClick={() => setCreating(false)}>Cancel</button><button className="button primary">Add app</button></footer></form></Modal>}
  </div>;
}
