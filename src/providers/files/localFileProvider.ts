import { invoke } from "@tauri-apps/api/core";

export type FileCategory = "document" | "note" | "book" | "media";

export interface LocalFile {
  name: string;
  path: string;
  extension: string;
  size: number;
  modifiedAt?: number;
}

export interface ProjectDirectory { name: string; path: string }

const rootsKey = (collection: string) => `homeroom.file-roots.${collection}`;
function rememberRoot(collection: string, root: string) {
  const roots = configuredRoots(collection);
  if (!roots.includes(root)) localStorage.setItem(rootsKey(collection), JSON.stringify([...roots, root]));
}
export function configuredRoots(collection: string): string[] {
  return JSON.parse(localStorage.getItem(rootsKey(collection)) ?? "[]") as string[];
}

export function isDesktopApp() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function requireDesktop() {
  if (!isDesktopApp()) throw new Error("Local folders are available in the Homeroom desktop app.");
}

export async function chooseAndScan(category: FileCategory): Promise<{ root?: string; files: LocalFile[] }> {
  requireDesktop();
  const root = await invoke<string | null>("choose_directory");
  if (!root) return { files: [] };
  rememberRoot(category, root);
  return { root, files: await invoke<LocalFile[]>("scan_files", { root, category }) };
}

export async function scanConfigured(category: FileCategory) {
  requireDesktop();
  const groups = await Promise.all(configuredRoots(category).map((root) => invoke<LocalFile[]>("scan_files", { root, category })));
  return [...new Map(groups.flat().map((file) => [file.path, file])).values()];
}

export async function chooseAndScanProjects(): Promise<{ root?: string; projects: ProjectDirectory[] }> {
  requireDesktop();
  const root = await invoke<string | null>("choose_directory");
  if (!root) return { projects: [] };
  rememberRoot("project", root);
  return { root, projects: await invoke<ProjectDirectory[]>("scan_projects", { root }) };
}

export async function scanConfiguredProjects() {
  requireDesktop();
  const groups = await Promise.all(configuredRoots("project").map((root) => invoke<ProjectDirectory[]>("scan_projects", { root })));
  return [...new Map(groups.flat().map((project) => [project.path, project])).values()];
}

export async function openLocalPath(path: string) {
  requireDesktop();
  await invoke("open_path", { path });
}

export async function readLocalText(path: string) {
  requireDesktop();
  return invoke<string>("read_text_file", { path });
}

export async function readLocalBytes(path: string) {
  requireDesktop();
  return new Uint8Array(await invoke<number[]>("read_binary_file", { path }));
}

export async function listLocalRoots() {
  if (!isDesktopApp()) return [];
  return invoke<string[]>("list_roots");
}
