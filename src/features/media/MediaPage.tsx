import { BookOpen, ExternalLink, Film, FolderInput, Gamepad2, Headphones, Play, Plus, RefreshCw, Search, Star, Trash2, Tv } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { mediaProvider } from "../../providers/media/mediaProvider";
import { EmptyState } from "../../shared/components/EmptyState";
import { Modal } from "../../shared/components/Modal";
import { appEvents } from "../../shared/events/eventBus";
import { useRepository } from "../../shared/hooks/useRepository";
import type { MediaItem, MediaKind, MediaStatus } from "../../shared/models/entities";
import { createId } from "../../shared/utils/id";
import { chooseAndScan, configuredRoots, openLocalPath, scanConfigured, type LocalFile } from "../../providers/files/localFileProvider";

const kindIcons = { book: BookOpen, movie: Film, series: Tv, podcast: Headphones, game: Gamepad2 };
const nextStatus: Record<MediaStatus, MediaStatus> = { backlog: "in-progress", "in-progress": "finished", finished: "backlog" };

export default function MediaPage() {
  const { items, save, saveMany, remove } = useRepository(mediaProvider); const [query, setQuery] = useState(""); const [status, setStatus] = useState<"all" | MediaStatus>("all"); const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const visible = useMemo(() => items.filter((item) => (status === "all" || item.status === status) && [item.name, item.creator, item.kind, ...item.tags].join(" ").toLowerCase().includes(query.toLowerCase())), [items, query, status]);
  async function create(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const media: MediaItem = { id: createId("media"), type: "media", name: String(data.get("name")), subtitle: String(data.get("creator")), creator: String(data.get("creator")), kind: String(data.get("kind")) as MediaKind, status: "backlog", progress: 0, tags: String(data.get("tags")).split(",").map((tag) => tag.trim()).filter(Boolean), createdAt: new Date().toISOString() }; await save(media); appEvents.emit("entity:changed", { action: "created", entity: media }); setCreating(false); }
  async function advance(item: MediaItem) { const next = { ...item, status: nextStatus[item.status], progress: item.status === "backlog" ? 10 : item.status === "in-progress" ? 100 : 0 }; await save(next); appEvents.emit("entity:changed", { action: next.status === "finished" ? "completed" : "updated", entity: next }); }
  async function rate(item: MediaItem, rating: number) { const next = { ...item, rating }; await save(next); appEvents.emit("entity:changed", { action: "updated", entity: next }); }
  async function discard(item: MediaItem) { await remove(item.id); appEvents.emit("entity:changed", { action: "deleted", entity: item }); }
  async function syncFiles(files: LocalFile[]) {
    const audio = new Set(["mp3", "flac", "wav", "m4a", "ogg"]);
    const imported: MediaItem[] = files.map((file) => { const existing = items.find(({ path }) => path === file.path); return existing ? { ...existing, name: file.name, subtitle: `${file.extension.toUpperCase()} · Local file` } : { id: createId("media"), type: "media", name: file.name, subtitle: `${file.extension.toUpperCase()} · Local file`, creator: "Local media", kind: audio.has(file.extension) ? "podcast" : "movie", status: "backlog", progress: 0, path: file.path, tags: ["local"], createdAt: new Date().toISOString() }; });
    await saveMany(imported);
    imported.forEach((media) => appEvents.emit("entity:changed", { action: items.some(({ id }) => id === media.id) ? "updated" : "created", entity: media }));
  }
  async function importFolder(refresh = false) {
    setImporting(true);
    try {
      await syncFiles(refresh ? await scanConfigured("media") : (await chooseAndScan("media")).files);
    } catch (error) { window.alert(error instanceof Error ? error.message : "Unable to import media."); }
    finally { setImporting(false); }
  }
  function open(item: MediaItem) { if (item.path) void openLocalPath(item.path); appEvents.emit("entity:changed", { action: "opened", entity: item }); }
  return <div className="page"><div className="page-heading"><div><span className="eyebrow">Watch, read, listen, play</span><h1>Media</h1><p>A considered queue for local movies, audio, and everything you want to experience.</p></div><div className="heading-actions">{configuredRoots("media").length > 0 && <button className="button ghost" onClick={() => void importFolder(true)} disabled={importing}><RefreshCw size={16} />Refresh</button>}<button className="button ghost" onClick={() => void importFolder()} disabled={importing}><FolderInput size={17} />{importing ? "Scanning…" : "Add media folder"}</button><button className="button primary" onClick={() => setCreating(true)}><Plus size={17} />Add media</button></div></div><div className="toolbar"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search media" /></label><div className="filter-pills">{(["all", "backlog", "in-progress", "finished"] as const).map((item) => <button key={item} className={status === item ? "active" : ""} onClick={() => setStatus(item)}>{item.replace("-", " ")}</button>)}</div></div>
    {visible.length ? <div className="media-grid">{visible.map((item) => { const Icon = kindIcons[item.kind]; return <article className="media-card" key={item.id}><div className={`media-cover ${item.kind}`}><Icon size={34} /><span>{item.kind}</span></div><div className="media-body"><span className="eyebrow">{item.path ? "Local file" : item.status.replace("-", " ")}</span><h3>{item.name}</h3><p>{item.creator}</p><div className="media-progress"><span style={{ width: `${item.progress}%` }} /></div><div className="rating">{[1,2,3,4,5].map((value) => <button key={value} onClick={() => void rate(item, value)}><Star size={14} fill={(item.rating ?? 0) >= value ? "currentColor" : "none"} /></button>)}</div><footer><div className="media-actions">{item.path && <button className="button compact" onClick={() => open(item)}><ExternalLink size={14} />Open</button>}<button className="button compact" onClick={() => void advance(item)}><Play size={14} />{item.status === "backlog" ? "Start" : item.status === "in-progress" ? "Finish" : "Replay"}</button></div><button className="icon-button" onClick={() => void discard(item)}><Trash2 size={15} /></button></footer></div></article>; })}</div> : <EmptyState icon={<Film />} title="Nothing in this queue" text="Add media or scan a local folder." />}
    {creating && <Modal title="Media" onClose={() => setCreating(false)}><form className="stack-form" onSubmit={(event) => void create(event)}><label>Title<input name="name" required autoFocus /></label><div className="form-row"><label>Kind<select name="kind"><option value="book">Book</option><option value="movie">Movie</option><option value="series">Series</option><option value="podcast">Podcast</option><option value="game">Game</option></select></label><label>Creator<input name="creator" placeholder="Author, director…" /></label></div><label>Tags<input name="tags" placeholder="fiction, weekend" /></label><footer><button type="button" className="button ghost" onClick={() => setCreating(false)}>Cancel</button><button className="button primary">Add to backlog</button></footer></form></Modal>}
  </div>;
}
