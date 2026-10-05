import { Eye, EyeOff } from "lucide-react";
import type { WidgetDefinition } from "../../../registry/widgetRegistry";
import { Modal } from "../../../shared/components/Modal";

export function DashboardCustomizer({ widgets, enabled, onToggle, onClose, onReset }: { widgets: WidgetDefinition[]; enabled: string[]; onToggle(id: string): void; onClose(): void; onReset(): void }) {
  return <Modal title="Dashboard widgets" onClose={onClose}><div className="widget-options">{widgets.map((widget) => { const visible = enabled.includes(widget.type); return <button key={widget.type} onClick={() => onToggle(widget.type)}><span className={visible ? "visible" : ""}>{visible ? <Eye size={17} /> : <EyeOff size={17} />}</span><div><strong>{widget.title}</strong><small>{widget.defaultSize} widget</small></div><em>{visible ? "Shown" : "Hidden"}</em></button>; })}</div><div className="customizer-footer"><button className="button ghost" onClick={onReset}>Show all</button><button className="button primary" onClick={onClose}>Done</button></div></Modal>;
}
