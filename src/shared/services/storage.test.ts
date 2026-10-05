import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalStorageRepository } from "./storage";

afterEach(() => vi.unstubAllGlobals());

describe("LocalStorageRepository", () => {
  it("seeds, updates, and removes a collection", async () => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });
    const browserWindow = new EventTarget();
    const changed = vi.fn();
    browserWindow.addEventListener("repository:changed", changed);
    vi.stubGlobal("window", browserWindow);
    const repository = new LocalStorageRepository("test.items", [{ id: "one", name: "First" }]);

    expect(await repository.list()).toEqual([{ id: "one", name: "First" }]);
    await repository.save({ id: "one", name: "Updated" });
    await repository.save({ id: "two", name: "Second" });
    expect(await repository.list()).toEqual([{ id: "two", name: "Second" }, { id: "one", name: "Updated" }]);
    await repository.saveMany([{ id: "two", name: "Second updated" }, { id: "three", name: "Third" }]);
    await repository.remove("one");
    expect(await repository.list()).toEqual([{ id: "two", name: "Second updated" }, { id: "three", name: "Third" }]);
    expect(changed).toHaveBeenCalledTimes(4);
  });
});
