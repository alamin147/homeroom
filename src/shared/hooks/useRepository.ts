import { useCallback, useEffect, useState } from "react";
import type { StorageRepository } from "../services/storage";
import { toSafeMessage } from "../models/errors";

export function useRepository<T extends { id: string }>(repository: StorageRepository<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const reload = useCallback(async () => {
    try { setError(undefined); setItems(await repository.list()); }
    catch (reason) { setError(toSafeMessage(reason)); }
    finally { setLoading(false); }
  }, [repository]);
  useEffect(() => {
    void reload();
    const refresh = () => void reload();
    window.addEventListener("repository:changed", refresh);
    return () => window.removeEventListener("repository:changed", refresh);
  }, [reload]);
  async function save(item: T) { await repository.save(item); await reload(); }
  async function saveMany(items: T[]) { await repository.saveMany(items); await reload(); }
  async function remove(id: string) { await repository.remove(id); await reload(); }
  return { items, loading, error, reload, save, saveMany, remove };
}
