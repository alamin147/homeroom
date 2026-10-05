import { AppError } from "../models/errors";

export interface StorageRepository<T extends { id: string }> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | null>;
  save(item: T): Promise<T>;
  saveMany(items: T[]): Promise<T[]>;
  remove(id: string): Promise<void>;
}

export class LocalStorageRepository<T extends { id: string }> implements StorageRepository<T> {
  constructor(
    private readonly key: string,
    private readonly seed: T[],
  ) {}

  async list(): Promise<T[]> {
    try {
      const value = localStorage.getItem(this.key);
      if (!value) {
        localStorage.setItem(this.key, JSON.stringify(this.seed));
        return structuredClone(this.seed);
      }
      return JSON.parse(value) as T[];
    } catch {
      throw new AppError("STORAGE_UNAVAILABLE", "Local data could not be loaded.", true);
    }
  }

  async get(id: string): Promise<T | null> {
    return (await this.list()).find((item) => item.id === id) ?? null;
  }

  async save(item: T): Promise<T> {
    const items = await this.list();
    const index = items.findIndex(({ id }) => id === item.id);
    if (index === -1) items.unshift(item);
    else items[index] = item;
    localStorage.setItem(this.key, JSON.stringify(items));
    if (typeof window !== "undefined") window.dispatchEvent(new Event("repository:changed"));
    return item;
  }

  async saveMany(nextItems: T[]): Promise<T[]> {
    const ids = new Set(nextItems.map(({ id }) => id));
    const items = [...nextItems, ...(await this.list()).filter(({ id }) => !ids.has(id))];
    localStorage.setItem(this.key, JSON.stringify(items));
    if (typeof window !== "undefined") window.dispatchEvent(new Event("repository:changed"));
    return nextItems;
  }

  async remove(id: string): Promise<void> {
    localStorage.setItem(this.key, JSON.stringify((await this.list()).filter((item) => item.id !== id)));
    if (typeof window !== "undefined") window.dispatchEvent(new Event("repository:changed"));
  }
}
