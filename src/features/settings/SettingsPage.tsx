import { Download, Upload } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { settings } from "../../shared/services/settings";
import { migrateLegacyDemoData } from "../../shared/services/dataMigrations";
import { resolvePalette, setThemeMode, setThemePalette, themePalettes, type ThemeMode, type ThemePalette } from "../../shared/services/theme";

const dataKeys = ["projects", "documents", "tasks", "notes", "library", "media", "apps", "services", "activity", "settings"].map((name) => `homeroom.${name}`).concat(["project", "document", "note", "book", "media"].map((name) => `homeroom.file-roots.${name}`));

export default function SettingsPage() {
  const [theme, setTheme] = useState<ThemeMode>(() => settings.get("appearance.theme", "auto"));
  const [palette, setPalette] = useState<ThemePalette>(() => resolvePalette(settings.get("appearance.palette", "homeroom")));
  const [area, setArea] = useState(() => settings.get("projects.defaultArea", "Personal"));
  const [kind, setKind] = useState(() => settings.get("documents.defaultKind", "note"));
  const [priority, setPriority] = useState(() => settings.get("tasks.defaultPriority", "medium"));
  const [message, setMessage] = useState("");

  function exportData() {
    const data = Object.fromEntries(dataKeys.map((key) => [key, localStorage.getItem(key)]));
    const blob = new Blob([JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), data }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `homeroom-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Backup downloaded.");
  }

  async function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text()) as { schemaVersion?: number; data?: Record<string, string | null> };
      if (backup.schemaVersion !== 1 || !backup.data) throw new Error("Invalid backup");
      for (const key of dataKeys) {
        const value = backup.data[key];
        if (typeof value === "string") localStorage.setItem(key, value);
      }
      migrateLegacyDemoData(true);
      window.location.reload();
    } catch {
      setMessage("That file is not a valid Homeroom backup.");
    }
  }

  return <div className="page settings-page">
    <div className="page-heading"><div><span className="eyebrow">Make it yours</span><h1>Settings</h1><p>Preferences are grouped by the feature that owns them.</p></div></div>
    <section className="settings-section"><header><h2>Appearance</h2><p>Choose a color palette and use its light or dark version.</p></header><div className="appearance-controls"><label>Mode<select value={theme} onChange={(event) => { const mode = event.target.value as ThemeMode; setTheme(mode); setThemeMode(mode); }}><option value="auto">Auto</option><option value="light">Light</option><option value="dark">Dark</option></select></label><label>Palette<select value={palette} onChange={(event) => { const next = event.target.value as ThemePalette; setPalette(next); setThemePalette(next); }}>{themePalettes.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}</select></label></div></section>
    <section className="settings-section"><header><h2>Projects</h2><p>Defaults for new projects.</p></header><label>Default area<input value={area} onChange={(event) => { setArea(event.target.value); settings.set("projects.defaultArea", event.target.value); }} /></label></section>
    <section className="settings-section"><header><h2>Tasks</h2><p>How new actions begin.</p></header><label>Default priority<select value={priority} onChange={(event) => { setPriority(event.target.value); settings.set("tasks.defaultPriority", event.target.value); }}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label></section>
    <section className="settings-section"><header><h2>Documents</h2><p>Defaults for your knowledge library.</p></header><label>Default kind<select value={kind} onChange={(event) => { setKind(event.target.value); settings.set("documents.defaultKind", event.target.value); }}><option value="note">Note</option><option value="reference">Reference</option><option value="checklist">Checklist</option></select></label></section>
    <section className="settings-section"><header><h2>Backup</h2><p>Keep a portable copy of every local module.</p></header><div className="backup-actions"><button className="button ghost" onClick={exportData}><Download size={16} />Export data</button><label className="button ghost import-button"><Upload size={16} />Import data<input type="file" accept="application/json" onChange={(event) => void importData(event)} /></label>{message && <span>{message}</span>}</div></section>
  </div>;
}
