import type { Document } from "../../shared/models/entities";
import type { StorageRepository } from "../../shared/services/storage";
import { LocalStorageRepository } from "../../shared/services/storage";

export interface DocumentProvider extends StorageRepository<Document> {}

export const documentProvider: DocumentProvider = new LocalStorageRepository(
  "homeroom.documents",
  [],
);
