import { CheckSquare, FileText, FolderKanban, NotebookPen } from "lucide-react";
import type { useHomeSummary } from "../useHomeSummary";

const navigate = (path: string) => window.dispatchEvent(new CustomEvent("navigate", { detail: path }));

export function OverviewBar({ summary }: { summary: ReturnType<typeof useHomeSummary> }) {
  const stats = [
    { label: "Active projects", value: summary.activeProjects, icon: FolderKanban, path: "/projects" },
    { label: "Open tasks", value: summary.openTasks, icon: CheckSquare, path: "/tasks" },
    { label: "Notes", value: summary.notes, icon: NotebookPen, path: "/notes" },
    { label: "Documents", value: summary.documents, icon: FileText, path: "/documents" },
  ];
  return <section className="overview-bar">{stats.map(({ label, value, icon: Icon, path }) => <button key={label} onClick={() => navigate(path)}><Icon size={17} /><strong>{value}</strong><span>{label}</span></button>)}</section>;
}
