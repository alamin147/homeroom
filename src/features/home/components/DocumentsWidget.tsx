import { FileText } from "lucide-react";
import { useDocuments } from "../../documents/useDocuments";

export function DocumentsWidget() {
  const { documents } = useDocuments();
  const recent = [...documents].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);
  return <article className="widget"><header><div><span className="eyebrow">Knowledge</span><h2>Recent documents</h2></div><FileText size={20} /></header>{recent.length ? <div className="mini-list">{recent.map((document) => <div key={document.id}><span className={`dot ${document.kind}`} /><div><strong>{document.name}</strong><small>{document.path ? "Local file" : document.kind}</small></div></div>)}</div> : <div className="widget-empty"><FileText size={24} /><strong>No documents yet</strong><button className="text-button" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "/documents" }))}>Add or import documents</button></div>}</article>;
}
