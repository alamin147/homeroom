import type { Note } from "../../shared/models/entities";
import { LocalStorageRepository } from "../../shared/services/storage";

export const noteProvider = new LocalStorageRepository<Note>("homeroom.notes", []);
