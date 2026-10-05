export interface BaseEntity {
  id: string;
  type: "project" | "document" | "task" | "note" | "resource" | "media" | "app" | "service";
  name: string;
  subtitle?: string;
  tags: string[];
}

export type ProjectStatus = "planned" | "active" | "on-hold" | "completed";

export interface Project extends BaseEntity {
  type: "project";
  description: string;
  area: string;
  status: ProjectStatus;
  progress: number;
  dueDate?: string;
  path?: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentKind = "note" | "reference" | "checklist";

export interface Document extends BaseEntity {
  type: "document";
  kind: DocumentKind;
  summary: string;
  projectId?: string;
  path?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = "low" | "medium" | "high";
export interface Task extends BaseEntity {
  type: "task";
  completed: boolean;
  priority: TaskPriority;
  dueDate?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note extends BaseEntity {
  type: "note";
  content: string;
  pinned: boolean;
  color: "sand" | "sage" | "lavender" | "clay";
  path?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resource extends BaseEntity {
  type: "resource";
  kind: "link" | "book" | "file";
  url?: string;
  path?: string;
  category: string;
  favorite: boolean;
  createdAt: string;
}

export type MediaKind = "book" | "movie" | "series" | "podcast" | "game";
export type MediaStatus = "backlog" | "in-progress" | "finished";
export interface MediaItem extends BaseEntity {
  type: "media";
  kind: MediaKind;
  status: MediaStatus;
  progress: number;
  rating?: number;
  creator?: string;
  path?: string;
  createdAt: string;
}

export interface AppLink extends BaseEntity {
  type: "app";
  url: string;
  category: string;
  favorite: boolean;
  color: string;
}

export type ServiceStatus = "unknown" | "checking" | "online" | "offline";
export interface ServiceMonitor extends BaseEntity {
  type: "service";
  url: string;
  status: ServiceStatus;
  latency?: number;
  lastChecked?: string;
}

export type Entity = Project | Document | Task | Note | Resource | MediaItem | AppLink | ServiceMonitor;
