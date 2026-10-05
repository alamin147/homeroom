import { ArrowUpRight } from "lucide-react";
import { useProjects } from "../../projects/useProjects";

export function ProjectPulseWidget() {
  const { projects } = useProjects();
  const active = projects.filter(({ status }) => status === "active");
  const average = active.length ? Math.round(active.reduce((sum, item) => sum + item.progress, 0) / active.length) : 0;
  return <article className="widget project-pulse"><header><div><span className="eyebrow">Momentum</span><h2>Project pulse</h2></div><ArrowUpRight size={20} /></header>{active.length ? <><div className="metric"><strong>{active.length}</strong><span>active projects</span></div><div className="ring" style={{ "--value": `${average * 3.6}deg` } as React.CSSProperties}><span>{average}%</span></div><p>Average progress across active projects.</p></> : <div className="widget-empty"><strong>No active projects</strong><button className="text-button" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "/projects" }))}>Create or import a project</button></div>}</article>;
}
