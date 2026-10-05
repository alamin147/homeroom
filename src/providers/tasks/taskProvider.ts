import type { Task } from "../../shared/models/entities";
import { LocalStorageRepository } from "../../shared/services/storage";

export const taskProvider = new LocalStorageRepository<Task>("homeroom.tasks", []);
