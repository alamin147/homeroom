import type { ComponentType, LazyExoticComponent } from "react";
import type { LucideIcon } from "lucide-react";

export interface RouteDefinition {
  id: string;
  title: string;
  path: string;
  order: number;
  icon: LucideIcon;
  component: LazyExoticComponent<ComponentType>;
  enabled?: boolean;
}

class RouteRegistry {
  private readonly routes = new Map<string, RouteDefinition>();

  register(route: RouteDefinition) {
    this.routes.set(route.id, route);
  }

  list() {
    return [...this.routes.values()]
      .filter(({ enabled = true }) => enabled)
      .sort((a, b) => a.order - b.order);
  }

  find(path: string) {
    return this.list().find((route) => route.path === path);
  }
}

export const routeRegistry = new RouteRegistry();
