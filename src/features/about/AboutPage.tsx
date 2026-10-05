import { Bug, Code2, Heart, Mail, Rocket, Sparkles } from "lucide-react";
import packageJson from "../../../package.json";

const releases = [
  {
    version: "1.0.0",
    label: "Current release",
    date: "October 2026",
    groups: [
      { title: "Added", icon: Sparkles, items: ["Full editing for tasks, notes, documents, library resources, media, app shortcuts, and service monitors.", "Direct progress and status editing for media entries."] },
      { title: "Improved", icon: Rocket, items: ["Edit forms preserve creation details, favorites, ratings, local-file links, and monitoring results.", "Icon-only actions now expose descriptive labels for assistive technology."] },
      { title: "Fixed", icon: Bug, items: ["Edited documents are now recorded as updates instead of duplicate creation activity.", "Changing a monitored service URL clears stale reachability results."] },
    ],
  },
  {
    version: "0.2.0",
    label: "Previous release",
    date: "October 2026",
    groups: [
      { title: "Added", icon: Sparkles, items: ["GitHub-style 53-week activity contribution graph with daily intensity and totals.", "Selectable service inspector with live terminal-style reachability logs.", "Local folder imports plus in-app Markdown, text, and PDF readers."] },
      { title: "Improved", icon: Rocket, items: ["Activity history now retains up to 1,000 meaningful workspace events.", "Service results clearly show status, latency, last-check time, and CORS-safe probe limits.", "Responsive layouts for the activity calendar and service workspace."] },
      { title: "Fixed", icon: Bug, items: ["Activity contributions are grouped using the user's local calendar day.", "Service monitoring no longer suggests that an opaque reachability probe is a full HTTP health check."] },
    ],
  },
  {
    version: "0.1.0",
    label: "Initial release",
    date: "October 2026",
    groups: [
      { title: "Added", icon: Sparkles, items: ["Local-first projects, tasks, notes, documents, library, media, apps, and service tracking.", "Customizable home dashboard, quick capture, global search, and command palette.", "Local backup export/import and secure access to user-selected folders."] },
    ],
  },
];

export default function AboutPage() {
  return <div className="page about-page">
    <section className="about-hero"><div className="about-mark">H</div><div><span className="eyebrow">About the application</span><h1>Homeroom</h1><p>A thoughtful, local-first home for the projects, files, routines, and services that shape everyday life.</p><span className="version-pill">Version {packageJson.version}</span></div></section>

    <section className="developer-card"><div className="developer-avatar">A</div><div className="developer-copy"><span className="eyebrow">Designed & developed by</span><h2>Alamin</h2><p>Independent developer behind Homeroom, building calm and useful desktop software with privacy and ownership at its center.</p><div className="developer-links"><span><Code2 size={15} />@alamin147</span><a href="mailto:alamin.14780@gmail.com"><Mail size={15} />alamin.14780@gmail.com</a></div></div><Heart className="developer-heart" size={21} /></section>

    <section className="changelog"><header><span className="eyebrow">Release notes</span><h2>Changelog</h2><p>Features, improvements, and fixes included with each Homeroom version.</p></header><div className="release-list">{releases.map((release, releaseIndex) => <article className="release" key={release.version}><div className="release-rail"><span className={releaseIndex === 0 ? "current" : ""} /><i /></div><div className="release-content"><header><div><span className="version-number">v{release.version}</span><strong>{release.label}</strong></div><time>{release.date}</time></header><div className="change-groups">{release.groups.map(({ title, icon: Icon, items }) => <section key={title}><h3><Icon size={15} />{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>)}</div></div></article>)}</div></section>
  </div>;
}
