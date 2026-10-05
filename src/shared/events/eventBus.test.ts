import { describe, expect, it, vi } from "vitest";
import { createEventBus } from "./eventBus";

describe("event bus", () => {
  it("delivers typed events and unsubscribes", () => {
    const bus = createEventBus<{ changed: { id: string } }>();
    const listener = vi.fn();
    const unsubscribe = bus.on("changed", listener);

    bus.emit("changed", { id: "one" });
    unsubscribe();
    bus.emit("changed", { id: "two" });

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ id: "one" });
  });
});
