import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export default function PdfReader({ data }: { data: Uint8Array }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [document, setDocument] = useState<PDFDocumentProxy>();
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.15);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const task = pdfjs.getDocument({ data: data.slice() });
    void task.promise.then(setDocument).catch(() => setError("This PDF could not be opened."));
    return () => { void task.destroy(); };
  }, [data]);

  useEffect(() => {
    if (!document || !canvasRef.current) return;
    let cancelled = false;
    let renderTask: ReturnType<Awaited<ReturnType<typeof document.getPage>>["render"]> | undefined;
    void document.getPage(page).then((pdfPage) => {
      if (cancelled || !canvasRef.current) return;
      const viewport = pdfPage.getViewport({ scale });
      const ratio = window.devicePixelRatio || 1;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      renderTask = pdfPage.render({ canvas, canvasContext: context, viewport, transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0] });
      return renderTask.promise;
    }).catch((reason) => {
      if (!cancelled && reason?.name !== "RenderingCancelledException") setError("This PDF page could not be rendered.");
    });
    return () => { cancelled = true; renderTask?.cancel(); };
  }, [document, page, scale]);

  if (error) return <div className="reader-error">{error}</div>;
  if (!document) return <div className="reader-loading">Preparing PDF…</div>;

  return <div className="pdf-reader">
    <div className="pdf-toolbar" aria-label="PDF controls">
      <button className="icon-button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} aria-label="Previous page"><ChevronLeft size={17} /></button>
      <span>Page <strong>{page}</strong> of {document.numPages}</span>
      <button className="icon-button" onClick={() => setPage((value) => Math.min(document.numPages, value + 1))} disabled={page === document.numPages} aria-label="Next page"><ChevronRight size={17} /></button>
      <span className="pdf-toolbar-separator" />
      <button className="icon-button" onClick={() => setScale((value) => Math.max(.6, value - .15))} aria-label="Zoom out"><Minus size={16} /></button>
      <span>{Math.round(scale * 100)}%</span>
      <button className="icon-button" onClick={() => setScale((value) => Math.min(2.5, value + .15))} aria-label="Zoom in"><Plus size={16} /></button>
    </div>
    <div className="pdf-stage"><canvas ref={canvasRef} /></div>
  </div>;
}
