import type { Entity } from "../shared/models/entities";

export interface SearchResult {
  id: string;
  title: string;
  detail: string;
  path: string;
  entity: Entity;
}

export interface SearchProvider {
  id: string;
  search(query: string): Promise<SearchResult[]>;
}

class SearchRegistry {
  private readonly providers = new Map<string, SearchProvider>();

  register(provider: SearchProvider) {
    this.providers.set(provider.id, provider);
  }

  async search(query: string) {
    const results = await Promise.allSettled(
      [...this.providers.values()].map((provider) => provider.search(query)),
    );
    return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
  }
}

export const searchRegistry = new SearchRegistry();
