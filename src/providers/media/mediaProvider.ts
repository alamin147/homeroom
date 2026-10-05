import type { MediaItem } from "../../shared/models/entities";
import { LocalStorageRepository } from "../../shared/services/storage";

export const mediaProvider = new LocalStorageRepository<MediaItem>("homeroom.media", []);
