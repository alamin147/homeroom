import type { AppLink } from "../../shared/models/entities";
import { LocalStorageRepository } from "../../shared/services/storage";

export const appProvider = new LocalStorageRepository<AppLink>("homeroom.apps", []);
