import type { Resource } from "../../shared/models/entities";
import { LocalStorageRepository } from "../../shared/services/storage";

export const resourceProvider = new LocalStorageRepository<Resource>("homeroom.library", []);
