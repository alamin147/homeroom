import { Activity, CheckCircle2, Clock3, ExternalLink, PlusCircle, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { clearActivity, listActivity, type ActivityItem } from "../../providers/activity/activityProvider";
import { EmptyState } from "../../shared/components/EmptyState";
import { buildContributionWeeks } from "./contribution";

const icons = { created: PlusCircle, updated: RefreshCw, completed: CheckCircle2, deleted: Trash2, opened: ExternalLink, checked: Activity };

export default function ActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>(listActivity);
  useEffect(() => { const reload = () => setItems(listActivity()); window.addEventListener("activity:changed", reload); return () => window.removeEventListener("activity:changed", reload); }, []);
  const weeks = useMemo(() => buildContributionWeeks(items), [items]);
  const visibleDays = weeks.flat().filter(({ future }) => !future);
  const activeDays = visibleDays.filter(({ count }) => count > 0).length;
  const total = visibleDays.reduce((sum, { count }) => sum + count, 0);
  return <div className="page"><div className="page-heading"><div><span className="eyebrow">A trail, not surveillance</span><h1>Activity</h1><p>Recent meaningful changes across your workspace.</p></div>{items.length > 0 && <button className="button ghost" onClick={() => { clearActivity(); setItems([]); }}><Trash2 size={15} />Clear history</button>}</div>
    <section className="contribution-panel" aria-label="Activity contributions over the last year">
      <header><div><span className="eyebrow">Last 12 months</span><h2>{total} contributions</h2></div><p>{activeDays} active {activeDays === 1 ? "day" : "days"}</p></header>
      <div className="contribution-scroll">
        <div className="contribution-months" aria-hidden="true">{weeks.map((week, index) => <span key={index}>{week.find(({ month }) => month)?.month ?? ""}</span>)}</div>
        <div className="contribution-body"><div className="contribution-weekdays" aria-hidden="true"><span>Mon</span><span>Wed</span><span>Fri</span></div><div className="contribution-grid">{weeks.flat().map((day) => <span key={day.date} className={`contribution-cell level-${day.level} ${day.future ? "future" : ""}`} title={`${day.label}: ${day.count} contribution${day.count === 1 ? "" : "s"}`} aria-label={`${day.label}: ${day.count} contributions`} />)}</div></div>
      </div>
      <footer><span>Less</span>{[0, 1, 2, 3, 4].map((level) => <i className={`contribution-cell level-${level}`} key={level} />)}<span>More</span></footer>
    </section>
    {items.length ? <div className="activity-timeline">{items.map((item) => { const Icon = icons[item.action]; return <article key={item.id}><div className="timeline-icon"><Icon size={16} /></div><div><p><strong>{item.entityName}</strong> was {item.action}</p><span>{item.entityType}</span></div><time><Clock3 size={13} />{new Date(item.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time></article>; })}</div> : <EmptyState icon={<Activity />} title="No activity yet" text="Create, complete, open, or check something and it will appear here." />}
  </div>;
}
