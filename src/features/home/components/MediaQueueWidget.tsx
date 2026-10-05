import { Play } from "lucide-react";
import { mediaProvider } from "../../../providers/media/mediaProvider";
import { useRepository } from "../../../shared/hooks/useRepository";

export function MediaQueueWidget() {
  const { items } = useRepository(mediaProvider); const current = items.find(({ status }) => status === "in-progress");
  return <article className="widget compact-widget"><header><div><span className="eyebrow">Continue</span><h2>Media queue</h2></div><Play size={20} /></header>{current ? <div className="continue-media"><strong>{current.name}</strong><span>{current.creator ?? current.kind}</span><div className="progress"><i style={{ width: `${current.progress}%` }} /></div><small>{current.progress}% complete</small></div> : <div className="widget-empty"><strong>No media in progress</strong><button className="text-button" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "/media" }))}>Open media library</button></div>}</article>;
}
