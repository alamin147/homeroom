import { Server } from "lucide-react";
import { serviceProvider } from "../../../providers/services/serviceProvider";
import { useRepository } from "../../../shared/hooks/useRepository";

export function ServiceHealthWidget() {
  const { items } = useRepository(serviceProvider); const online = items.filter(({ status }) => status === "online").length; const offline = items.filter(({ status }) => status === "offline").length;
  return <article className="widget compact-widget"><header><div><span className="eyebrow">Infrastructure</span><h2>Services</h2></div><Server size={20} /></header>{items.length ? <div className="health-metric"><strong>{offline ? `${offline} down` : online ? `${online} online` : "Unchecked"}</strong><span>{offline ? "Needs attention" : online ? "Last known status" : `${items.length} configured`}</span></div> : <div className="widget-empty"><strong>No services configured</strong><button className="text-button" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "/services" }))}>Add a service</button></div>}</article>;
}
