import type { Project } from "../../shared/models/entities";
import type { StorageRepository } from "../../shared/services/storage";
import { LocalStorageRepository } from "../../shared/services/storage";

export interface ProjectProvider extends StorageRepository<Project> {}

export const projectProvider: ProjectProvider = new LocalStorageRepository(
  "homeroom.projects",
  [],
);
