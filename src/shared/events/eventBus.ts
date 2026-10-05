import type { Document, Entity, Project } from "../models/entities";

export interface AppEvents {
  "project:created": Project;
  "project:updated": Project;
  "document:created": Document;
  "entity:changed": { action: "created" | "updated" | "completed" | "deleted" | "opened" | "checked"; entity: Entity };
}

type Handler<T> = (payload: T) => void;

export function createEventBus<TEvents extends object>() {
  const listeners = new Map<keyof TEvents, Set<Handler<never>>>();

  return {
    emit<K extends keyof TEvents>(event: K, payload: TEvents[K]) {
      listeners.get(event)?.forEach((handler) => handler(payload as never));
    },
    on<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>) {
      const handlers = listeners.get(event) ?? new Set();
      handlers.add(handler as Handler<never>);
      listeners.set(event, handlers);
      return () => handlers.delete(handler as Handler<never>);
    },
  };
}

export const appEvents = createEventBus<AppEvents>();
