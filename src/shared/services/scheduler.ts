type Job = { timer: number; subscribers: number };

const jobs = new Map<string, Job>();

export function subscribeToJob(id: string, intervalMs: number, task: () => void) {
  const existing = jobs.get(id);
  if (existing) {
    existing.subscribers += 1;
  } else {
    task();
    jobs.set(id, { timer: window.setInterval(task, intervalMs), subscribers: 1 });
  }

  return () => {
    const job = jobs.get(id);
    if (!job) return;
    job.subscribers -= 1;
    if (job.subscribers === 0) {
      clearInterval(job.timer);
      jobs.delete(id);
    }
  };
}
