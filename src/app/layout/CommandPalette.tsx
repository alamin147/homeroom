import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { searchRegistry, type SearchResult } from "../../registry/searchRegistry";
import { actionRegistry } from "../../registry/actionRegistry";

export function CommandPalette({ open, onClose, navigate }: { open: boolean; onClose(): void; navigate(path: string): void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  useEffect(() => {
    if (!open) { setQuery(""); setResults([]); return; }
    const timer = window.setTimeout(() => { if (query.trim()) void searchRegistry.search(query).then(setResults); else setResults([]); }, 120);
    return () => clearTimeout(timer);
  }, [open, query]);
  if (!open) return null;
  return <div className="palette-backdrop" onMouseDown={onClose}><section className="palette" onMouseDown={(event) => event.stopPropagation()}><label><Search size={20} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search everything…" /><button className="icon-button" onClick={onClose}><X size={18} /></button></label><div className="palette-results">{!query ? <p>Find projects, tasks, notes, media, apps, services, and resources.</p> : results.length ? results.map((result) => <div className="palette-result" key={result.id}><button className="result-main" onClick={() => { navigate(result.path); onClose(); }}><strong>{result.title}</strong><span>{result.detail}</span></button><div>{actionRegistry.forEntity(result.entity).map((action) => <button className="result-action" key={action.id} onClick={() => void action.execute(result.entity)}>{action.label}</button>)}</div></div>) : <p>No matches yet.</p>}</div><footer><span>↵ open</span><span>esc close</span></footer></section></div>;
}
