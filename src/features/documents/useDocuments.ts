import { useCallback, useEffect, useState } from "react";
import { documentProvider } from "../../providers/documents/documentProvider";
import { appEvents } from "../../shared/events/eventBus";
import type { Document } from "../../shared/models/entities";
import { toSafeMessage } from "../../shared/models/errors";

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const reload = useCallback(async () => {
    try { setError(undefined); setDocuments(await documentProvider.list()); }
    catch (reason) { setError(toSafeMessage(reason)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);

  async function save(document: Document) {
    const exists = documents.some(({ id }) => id === document.id);
    await documentProvider.save(document);
    if (!exists) appEvents.emit("document:created", document);
    appEvents.emit("entity:changed", { action: exists ? "updated" : "created", entity: document });
    await reload();
  }
  async function remove(id: string) {
    const document = documents.find((item) => item.id === id);
    await documentProvider.remove(id);
    if (document) appEvents.emit("entity:changed", { action: "deleted", entity: document });
    await reload();
  }
  return { documents, loading, error, reload, save, remove };
}
