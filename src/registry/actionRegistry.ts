import type { Entity } from "../shared/models/entities";

export interface EntityAction {
  id: string;
  label: string;
  supports(entity: Entity): boolean;
  execute(entity: Entity): Promise<void>;
}

class ActionRegistry {
  private readonly actions = new Map<string, EntityAction>();

  register(action: EntityAction) {
    this.actions.set(action.id, action);
  }

  forEntity(entity: Entity) {
    return [...this.actions.values()].filter((action) => action.supports(entity));
  }
}

export const actionRegistry = new ActionRegistry();
