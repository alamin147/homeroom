import type { ServiceMonitor } from "../../shared/models/entities";
import { LocalStorageRepository } from "../../shared/services/storage";

export const serviceProvider = new LocalStorageRepository<ServiceMonitor>("homeroom.services", []);

export async function checkService(service: ServiceMonitor): Promise<ServiceMonitor> {
  const started = performance.now();
  try {
    await fetch(service.url, { mode: "no-cors", cache: "no-store", signal: AbortSignal.timeout(5000) });
    return { ...service, status: "online", latency: Math.round(performance.now() - started), lastChecked: new Date().toISOString() };
  } catch {
    return { ...service, status: "offline", latency: undefined, lastChecked: new Date().toISOString() };
  }
}
