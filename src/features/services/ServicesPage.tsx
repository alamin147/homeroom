import { Activity, Globe2, Pencil, Plus, RefreshCw, Server, Terminal, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { checkService, serviceProvider } from "../../providers/services/serviceProvider";
import { EmptyState } from "../../shared/components/EmptyState";
import { Modal } from "../../shared/components/Modal";
import { appEvents } from "../../shared/events/eventBus";
import { useRepository } from "../../shared/hooks/useRepository";
import type { ServiceMonitor } from "../../shared/models/entities";
import { createId } from "../../shared/utils/id";

type ProbeTone = "command" | "info" | "success" | "error";
interface ProbeLine { id: string; time: string; tone: ProbeTone; text: string }

function clock() {
  return new Date().toLocaleTimeString(undefined, { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function endpointHost(url: string) {
  try { return new URL(url).host; } catch { return url; }
}

export default function ServicesPage() {
  const { items, save, remove } = useRepository(serviceProvider);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ServiceMonitor>();
  const [checking, setChecking] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [logs, setLogs] = useState<Record<string, ProbeLine[]>>({});
  const selected = items.find(({ id }) => id === selectedId);

  useEffect(() => {
    if (!items.length) setSelectedId(undefined);
    else if (!items.some(({ id }) => id === selectedId)) setSelectedId(items[0].id);
  }, [items, selectedId]);

  function write(serviceId: string, tone: ProbeTone, text: string) {
    const line = { id: crypto.randomUUID(), time: clock(), tone, text };
    setLogs((current) => ({ ...current, [serviceId]: [...(current[serviceId] ?? []), line].slice(-30) }));
  }

  async function check(item: ServiceMonitor) {
    setSelectedId(item.id);
    write(item.id, "command", `$ probe --timeout 5000 ${item.url}`);
    write(item.id, "info", "Dispatching a CORS-safe reachability request…");
    const pending = { ...item, status: "checking" as const };
    await save(pending);
    const result = await checkService(item);
    await save(result);
    if (result.status === "online") {
      write(item.id, "success", `Reachable · response received in ${result.latency} ms`);
      write(item.id, "info", "HTTP response details are hidden by CORS-safe mode.");
    } else {
      write(item.id, "error", "No response · endpoint unreachable or request timed out");
    }
    write(item.id, "info", `Saved result at ${new Date(result.lastChecked ?? Date.now()).toLocaleString()}`);
    appEvents.emit("entity:changed", { action: "checked", entity: result });
  }

  async function checkAll() {
    setChecking(true);
    for (const item of items) await check(item);
    setChecking(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const url = String(data.get("url"));
    const service: ServiceMonitor = { ...editing, id: editing?.id ?? createId("service"), type: "service", name: String(data.get("name")), subtitle: String(data.get("subtitle")), url, status: editing && editing.url === url ? editing.status : "unknown", latency: editing && editing.url === url ? editing.latency : undefined, lastChecked: editing && editing.url === url ? editing.lastChecked : undefined, tags: editing?.tags ?? [] };
    await save(service);
    appEvents.emit("entity:changed", { action: editing ? "updated" : "created", entity: service });
    setSelectedId(service.id);
    setCreating(false);
    setEditing(undefined);
  }

  async function discard(service: ServiceMonitor) {
    await remove(service.id);
    appEvents.emit("entity:changed", { action: "deleted", entity: service });
  }

  const online = items.filter(({ status }) => status === "online").length;
  const offline = items.filter(({ status }) => status === "offline").length;
  const selectedLogs = selected ? logs[selected.id] ?? [] : [];

  return <div className="page"><div className="page-heading"><div><span className="eyebrow">Reachability monitor</span><h1>Services</h1><p>Select an endpoint to inspect it, then watch each real probe progress.</p></div><div className="heading-actions"><button className="button ghost" onClick={() => void checkAll()} disabled={checking || !items.length}><RefreshCw size={16} className={checking ? "spin" : ""} />Check all</button><button className="button primary" onClick={() => setCreating(true)}><Plus size={17} />Add service</button></div></div>
    <section className="service-summary"><div><Activity /><strong>{online}/{items.length}</strong><span>currently online</span></div><p>{offline ? `${offline} endpoint${offline === 1 ? " needs" : "s need"} attention` : "Checks run on demand from this device"}</p></section>
    {items.length ? <div className="service-workspace">
      <div className="service-list">{items.map((item) => <article className={selectedId === item.id ? "selected" : ""} key={item.id} role="button" tabIndex={0} aria-selected={selectedId === item.id} onClick={() => setSelectedId(item.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedId(item.id); }}><span className={`service-dot ${item.status}`} /><div><h3>{item.name}</h3><p>{endpointHost(item.url)}</p></div><div className="service-meta"><strong>{item.status}</strong><span>{item.latency ? `${item.latency} ms` : item.lastChecked ? "No response" : "Not checked"}</span></div><button className="button compact" onClick={(event) => { event.stopPropagation(); void check(item); }} disabled={item.status === "checking"}><RefreshCw size={14} className={item.status === "checking" ? "spin" : ""} />Check</button><button className="icon-button" onClick={(event) => { event.stopPropagation(); setEditing(item); }} aria-label={`Edit ${item.name}`}><Pencil size={15} /></button><button className="icon-button" onClick={(event) => { event.stopPropagation(); void discard(item); }} aria-label={`Delete ${item.name}`}><Trash2 size={15} /></button></article>)}</div>
      {selected && <aside className="service-inspector"><header><div><span className={`service-dot ${selected.status}`} /><div><span className="eyebrow">Selected endpoint</span><h2>{selected.name}</h2></div></div><button className="button compact" onClick={() => void check(selected)} disabled={selected.status === "checking"}><RefreshCw size={14} className={selected.status === "checking" ? "spin" : ""} />Probe now</button></header>
        <a className="service-url" href={selected.url} target="_blank" rel="noreferrer"><Globe2 size={15} />{selected.url}</a>
        <div className="service-facts"><div><span>Status</span><strong className={selected.status}>{selected.status}</strong></div><div><span>Latency</span><strong>{selected.latency ? `${selected.latency} ms` : "—"}</strong></div><div><span>Last checked</span><strong>{selected.lastChecked ? new Date(selected.lastChecked).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Never"}</strong></div></div>
        <div className="probe-terminal"><div className="terminal-bar"><span><i /><i /><i /></span><strong><Terminal size={13} />probe://{endpointHost(selected.url)}</strong></div><div className="terminal-output" aria-live="polite">{selectedLogs.length ? selectedLogs.map((line) => <div className={line.tone} key={line.id}><time>{line.time}</time><span>{line.text}</span></div>) : <div className="info"><time>{clock()}</time><span>Monitor ready. Run a probe to test this endpoint.</span></div>}{selected.status === "checking" && <div className="terminal-cursor"><time>···</time><span>Waiting for endpoint<span className="cursor-block" /></span></div>}</div></div>
      </aside>}
    </div> : <EmptyState icon={<Server />} title="No services configured" text="Add a URL to open the live endpoint inspector." />}
    {(creating || editing) && <Modal title={editing ? "Edit service" : "Service"} onClose={() => { setCreating(false); setEditing(undefined); }}><form className="stack-form" onSubmit={(event) => void submit(event)}><label>Name<input name="name" required autoFocus defaultValue={editing?.name} placeholder="Home Assistant" /></label><label>URL<input name="url" type="url" required defaultValue={editing?.url} placeholder="http://homeassistant.local:8123" /></label><label>Context<input name="subtitle" defaultValue={editing?.subtitle} placeholder="Smart home hub" /></label><footer><button type="button" className="button ghost" onClick={() => { setCreating(false); setEditing(undefined); }}>Cancel</button><button className="button primary">{editing ? "Save changes" : "Add service"}</button></footer></form></Modal>}
  </div>;
}
