import { BookOpen, CheckSquare, ExternalLink, File, FileText, FolderInput, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "../../shared/components/EmptyState";
import { Modal } from "../../shared/components/Modal";
import type { DocumentKind } from "../../shared/models/entities";
import { DocumentForm } from "./components/DocumentForm";
import { useDocuments } from "./useDocuments";
import { chooseAndScan, configuredRoots, openLocalPath, scanConfigured, type LocalFile } from "../../providers/files/localFileProvider";
import { documentProvider } from "../../providers/documents/documentProvider";
import { appEvents } from "../../shared/events/eventBus";
import type { Document } from "../../shared/models/entities";
import { createId } from "../../shared/utils/id";
import { ReaderModal, readerFormat, type ReaderSource } from "../../shared/components/reader/ReaderModal";

const icons = { note: FileText, reference: File, checklist: CheckSquare };

export default function DocumentsPage() {
  const { documents, loading, error, reload, save, remove } = useDocuments();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | DocumentKind>("all");
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [reader, setReader] = useState<ReaderSource>();
  const visible = useMemo(() => documents.filter((document) => (kind === "all" || document.kind === kind) && [document.name, document.summary, ...document.tags].join(" ").toLowerCase().includes(query.toLowerCase())), [documents, kind, query]);

  async function syncFiles(files: LocalFile[]) {
    const now = new Date().toISOString();
    const imported: Document[] = files.map((file) => { const existing = documents.find(({ path }) => path === file.path); const updatedAt = new Date((file.modifiedAt ?? Date.now() / 1000) * 1000).toISOString(); return existing ? { ...existing, name: file.name, subtitle: file.extension.toUpperCase(), summary: file.path, updatedAt } : { id: createId("document"), type: "document", name: file.name, subtitle: file.extension.toUpperCase(), kind: ["md", "txt"].includes(file.extension) ? "note" : "reference", summary: file.path, path: file.path, tags: ["local"], createdAt: now, updatedAt }; });
    await documentProvider.saveMany(imported);
    imported.forEach((document) => appEvents.emit("entity:changed", { action: documents.some(({ id }) => id === document.id) ? "updated" : "created", entity: document }));
    await reload();
  }

  async function importFolder(refresh = false) {
    setImporting(true);
    try {
      await syncFiles(refresh ? await scanConfigured("document") : (await chooseAndScan("document")).files);
    } catch (error) { window.alert(error instanceof Error ? error.message : "Unable to import documents."); }
    finally { setImporting(false); }
  }

  return <div className="page">
    <div className="page-heading"><div><span className="eyebrow">Knowledge, in context</span><h1>Documents</h1><p>Keep notes, references, and checklists connected to the work they support.</p></div><div className="heading-actions">{configuredRoots("document").length > 0 && <button className="button ghost" onClick={() => void importFolder(true)} disabled={importing}><RefreshCw size={16} />Refresh</button>}<button className="button ghost" onClick={() => void importFolder()} disabled={importing}><FolderInput size={17} />{importing ? "Scanning…" : "Add folder"}</button><button className="button primary" onClick={() => setCreating(true)}><Plus size={17} />New document</button></div></div>
    <div className="toolbar"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documents" /></label><div className="filter-pills">{(["all", "note", "reference", "checklist"] as const).map((item) => <button className={kind === item ? "active" : ""} key={item} onClick={() => setKind(item)}>{item}</button>)}</div></div>
    {loading ? <div className="loading">Opening your library…</div> : error ? <div className="error-state"><strong>{error}</strong><button onClick={() => void reload()}>Try again</button></div> : visible.length ? <div className="document-list">{visible.map((document) => { const Icon = icons[document.kind]; const format = readerFormat(document.path); return <article className="document-row" key={document.id}><div className={`document-icon ${document.kind}`}><Icon size={20} /></div><div className="document-main"><span className="eyebrow">{document.path ? "Local file" : document.kind}</span><h3>{document.name}</h3><p>{document.summary}</p></div><div className="tags">{document.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><time>{new Date(document.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time><div className="row-actions">{document.path && format && <button className="icon-button" onClick={() => setReader({ title: document.name, path: document.path, format })} aria-label={`Read ${document.name}`}><BookOpen size={16} /></button>}{document.path && <button className="icon-button" onClick={() => void openLocalPath(document.path!)} aria-label={`Open ${document.name} in default app`}><ExternalLink size={16} /></button>}<button className="icon-button" onClick={() => void remove(document.id)} aria-label={`Delete ${document.name}`}><Trash2 size={16} /></button></div></article>; })}</div> : <EmptyState icon={<FileText />} title="No documents found" text="Add a useful note, reference, or checklist." />}
    {creating && <Modal title="Document" onClose={() => setCreating(false)}><DocumentForm onCancel={() => setCreating(false)} onSave={async (document) => { await save(document); setCreating(false); }} /></Modal>}
    {reader && <ReaderModal source={reader} onClose={() => setReader(undefined)} />}
  </div>;
}
