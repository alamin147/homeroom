import { ExternalLink, X } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { openLocalPath, readLocalBytes, readLocalText } from "../../../providers/files/localFileProvider";

const MarkdownReader = lazy(() => import("./MarkdownReader"));
const PdfReader = lazy(() => import("./PdfReader"));

export type ReaderFormat = "markdown" | "text" | "pdf";
export interface ReaderSource { title: string; format: ReaderFormat; path?: string; content?: string }

export function readerFormat(path?: string): ReaderFormat | undefined {
  const extension = path?.split(".").pop()?.toLowerCase();
  if (extension === "md" || extension === "markdown") return "markdown";
  if (extension === "txt") return "text";
  if (extension === "pdf") return "pdf";
}

export function ReaderModal({ source, onClose }: { source: ReaderSource; onClose(): void }) {
  const [content, setContent] = useState<string | Uint8Array | undefined>(source.content);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (source.content !== undefined || !source.path) return;
    let active = true;
    setContent(undefined); setError(undefined);
    const request = source.format === "pdf" ? readLocalBytes(source.path) : readLocalText(source.path);
    void request.then((value) => { if (active) setContent(value); }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Unable to read this file."); });
    return () => { active = false; };
  }, [source]);

  return <div className="reader-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="reader-shell" role="dialog" aria-modal="true" aria-label={source.title} onMouseDown={(event) => event.stopPropagation()}>
      <header className="reader-header">
        <div><span className="eyebrow">{source.format === "pdf" ? "PDF reader" : source.format === "markdown" ? "Markdown reader" : "Text reader"}</span><h2>{source.title}</h2>{source.path && <p title={source.path}>{source.path}</p>}</div>
        <div className="reader-actions">{source.path && <button className="button ghost" onClick={() => void openLocalPath(source.path!)}><ExternalLink size={16} />Default app</button>}<button className="icon-button" onClick={onClose} aria-label="Close reader"><X size={19} /></button></div>
      </header>
      <main className="reader-content">
        {error ? <div className="reader-error">{error}</div> : content === undefined ? <div className="reader-loading">Opening document…</div> : <Suspense fallback={<div className="reader-loading">Loading reader…</div>}>
          {source.format === "pdf" ? <PdfReader data={content as Uint8Array} /> : source.format === "markdown" ? <MarkdownReader content={content as string} /> : <pre className="reader-text">{content as string}</pre>}
        </Suspense>}
      </main>
    </section>
  </div>;
}
