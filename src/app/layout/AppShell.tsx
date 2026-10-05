import { Command, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { routeRegistry } from "../../registry/routeRegistry";
import { ErrorBoundary } from "../../shared/components/ErrorBoundary";
import { CommandPalette } from "./CommandPalette";

export function AppShell() {
  const [path, setPath] = useState(window.location.pathname);
  const [collapsed, setCollapsed] = useState(false);
  const [palette, setPalette] = useState(false);
  const routes = useMemo(() => routeRegistry.list(), []);
  const route = routeRegistry.find(path) ?? routes[0];
  const Page = route.component;

  function navigate(next: string) {
    history.pushState({}, "", next); setPath(next);
  }

  useEffect(() => {
    const popstate = () => setPath(window.location.pathname);
    const custom = (event: Event) => navigate((event as CustomEvent<string>).detail);
    const keydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPalette((value) => !value); }
      if (event.key === "Escape") setPalette(false);
    };
    window.addEventListener("popstate", popstate); window.addEventListener("navigate", custom); window.addEventListener("keydown", keydown);
    return () => { window.removeEventListener("popstate", popstate); window.removeEventListener("navigate", custom); window.removeEventListener("keydown", keydown); };
  }, []);

  return <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
    <aside className="sidebar"><div className="brand"><div className="brand-mark">H</div><div><strong>Homeroom</strong><span>Life, thoughtfully arranged</span></div></div><nav>{routes.map(({ id, title, path: routePath, icon: Icon }) => <button key={id} className={path === routePath ? "active" : ""} onClick={() => navigate(routePath)} title={title}><Icon size={19} /><span>{title}</span></button>)}</nav><div className="sidebar-bottom"><button className="command-hint" onClick={() => setPalette(true)}><Command size={17} /><span>Quick search</span><kbd>⌘ K</kbd></button><button className="collapse-button" onClick={() => setCollapsed((value) => !value)}>{collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}<span>Collapse</span></button></div></aside>
    <main><ErrorBoundary key={route.id}><Suspense fallback={<div className="loading">Preparing your space…</div>}><Page /></Suspense></ErrorBoundary></main>
    <CommandPalette open={palette} onClose={() => setPalette(false)} navigate={navigate} />
  </div>;
}
