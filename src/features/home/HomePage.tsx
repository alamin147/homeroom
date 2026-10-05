import { ArrowRight, FileText, FolderKanban, Play, Plus, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { widgetRegistry } from "../../registry/widgetRegistry";
import { settings } from "../../shared/services/settings";
import { DashboardCustomizer } from "./components/DashboardCustomizer";
import { DocumentsWidget } from "./components/DocumentsWidget";
import { OverviewBar } from "./components/OverviewBar";
import { ProjectPulseWidget } from "./components/ProjectPulseWidget";
import { QuickCapture } from "./components/QuickCapture";
import { MediaQueueWidget } from "./components/MediaQueueWidget";
import { ServiceHealthWidget } from "./components/ServiceHealthWidget";
import { UpcomingTasksWidget } from "./components/UpcomingTasksWidget";
import { useHomeSummary } from "./useHomeSummary";

let widgetsRegistered = false;
if (!widgetsRegistered) {
  widgetsRegistered = true;
  widgetRegistry.register({ type: "projects", title: "Project pulse", component: ProjectPulseWidget, defaultSize: "medium", order: 20 });
  widgetRegistry.register({ type: "documents", title: "Recent documents", component: DocumentsWidget, defaultSize: "medium", order: 30 });
  widgetRegistry.register({ type: "upcoming", title: "Task agenda", component: UpcomingTasksWidget, defaultSize: "wide", order: 35 });
  widgetRegistry.register({ type: "media", title: "Media queue", component: MediaQueueWidget, defaultSize: "small", order: 50 });
  widgetRegistry.register({ type: "services", title: "Services", component: ServiceHealthWidget, defaultSize: "small", order: 60 });
}

export default function HomePage() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const date = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const widgets = useMemo(() => widgetRegistry.list(), []);
  const defaults = useMemo(() => widgets.map(({ type }) => type), [widgets]);
  const [enabled, setEnabled] = useState(() => settings.get<string[]>("home.widgets", defaults));
  const [capturing, setCapturing] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const summary = useHomeSummary();
  function updateEnabled(next: string[]) { setEnabled(next); settings.set("home.widgets", next); }
  function toggleWidget(type: string) { updateEnabled(enabled.includes(type) ? enabled.filter((item) => item !== type) : [...enabled, type]); }
  return <div className="page home-page">
    <section className="home-header"><div><span className="eyebrow">{date}</span><h1>{greeting}</h1></div><div className="home-actions"><button className="button primary" onClick={() => setCapturing(true)}><Plus size={17} />Quick add</button><button className="button ghost" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "/tasks" }))}>Tasks <ArrowRight size={16} /></button></div></section>
    {summary.loading ? <div className="loading">Loading your data…</div> : summary.total > 0 ? <><OverviewBar summary={summary} />
      <div className="dashboard-heading"><div><span className="eyebrow">Live overview</span><h2>Your dashboard</h2></div><button className="button ghost" onClick={() => setCustomizing(true)}><SlidersHorizontal size={16} />Customize</button></div>
      <section className="widget-grid">{widgets.filter(({ type }) => enabled.includes(type)).map(({ type, component: Widget, defaultSize }) => <div className={`widget-slot ${defaultSize}`} key={type}><Widget /></div>)}</section>
      {enabled.length === 0 && <div className="dashboard-empty"><p>Your dashboard is empty.</p><button className="button ghost" onClick={() => updateEnabled(defaults)}>Show all widgets</button></div>}</> : <section className="home-setup"><span className="eyebrow">Start with real data</span><h2>Bring your work and files into Homeroom</h2><p>Add something yourself or connect the folders you already use. Nothing is pre-filled.</p><div>{[{ label: "Projects", path: "/projects", icon: FolderKanban }, { label: "Documents", path: "/documents", icon: FileText }, { label: "Media", path: "/media", icon: Play }].map(({ label, path, icon: Icon }) => <button key={path} onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: path }))}><Icon size={19} /><span><strong>{label}</strong><small>Open and connect</small></span><ArrowRight size={16} /></button>)}</div></section>}
    {capturing && <QuickCapture onClose={() => setCapturing(false)} />}
    {customizing && <DashboardCustomizer widgets={widgets} enabled={enabled} onToggle={toggleWidget} onClose={() => setCustomizing(false)} onReset={() => updateEnabled(defaults)} />}
  </div>;
}
