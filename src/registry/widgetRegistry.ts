import type { ComponentType } from "react";

export interface WidgetDefinition {
  type: string;
  title: string;
  component: ComponentType;
  defaultSize: "small" | "medium" | "wide";
  order: number;
}

class WidgetRegistry {
  private readonly widgets = new Map<string, WidgetDefinition>();

  register(widget: WidgetDefinition) {
    this.widgets.set(widget.type, widget);
  }

  list() {
    return [...this.widgets.values()].sort((a, b) => a.order - b.order);
  }
}

export const widgetRegistry = new WidgetRegistry();
