import { invoke } from "@tauri-apps/api/core";
import { settings } from "./settings";

export type ThemeMode = "auto" | "light" | "dark";
export type ResolvedTheme = Exclude<ThemeMode, "auto">;

export const themePalettes = [
  { id: "homeroom", label: "Homeroom" },
  { id: "matugen", label: "Matugen (DMS auto)" },
  { id: "gruvbox", label: "Gruvbox" },
  { id: "tokyo-night", label: "Tokyo Night" },
  { id: "catppuccin", label: "Catppuccin" },
  { id: "nord", label: "Nord" },
  { id: "solarized", label: "Solarized" },
] as const;

export type ThemePalette = (typeof themePalettes)[number]["id"];

const preference = "(prefers-color-scheme: dark)";
const defaultPalette: ThemePalette = "homeroom";
const themeColors: Record<ThemePalette, Record<ResolvedTheme, string>> = {
  homeroom: { light: "#f3efe5", dark: "#151a17" },
  matugen: { light: "#f3efe5", dark: "#151a17" },
  gruvbox: { light: "#fbf1c7", dark: "#282828" },
  "tokyo-night": { light: "#d5d6db", dark: "#1a1b26" },
  catppuccin: { light: "#eff1f5", dark: "#1e1e2e" },
  nord: { light: "#eceff4", dark: "#2e3440" },
  solarized: { light: "#fdf6e3", dark: "#002b36" },
};

const matugenTokenNames = [
  "appBg", "ink", "muted", "paper", "line", "green", "greenSoft", "amber", "accentHover",
  "sidebarBg", "surface", "surfaceStrong", "field", "surfaceSubtle", "surfaceHover", "readerCanvas",
  "track", "selected", "onAccent", "onAccentMuted",
] as const;

type MatugenTokenName = (typeof matugenTokenNames)[number];
export type MatugenTheme = Record<ResolvedTheme, Record<MatugenTokenName, string>>;

const matugenCssProperties: Record<MatugenTokenName, string> = {
  appBg: "--app-bg", ink: "--ink", muted: "--muted", paper: "--paper", line: "--line",
  green: "--green", greenSoft: "--green-soft", amber: "--amber", accentHover: "--accent-hover",
  sidebarBg: "--sidebar-bg", surface: "--surface", surfaceStrong: "--surface-strong", field: "--field",
  surfaceSubtle: "--surface-subtle", surfaceHover: "--surface-hover", readerCanvas: "--reader-canvas",
  track: "--track", selected: "--selected", onAccent: "--on-accent", onAccentMuted: "--on-accent-muted",
};

let matugenTheme: MatugenTheme | null = null;

export function resolveTheme(mode: ThemeMode, prefersDark: boolean): ResolvedTheme {
  return mode === "auto" ? (prefersDark ? "dark" : "light") : mode;
}

export function resolvePalette(value: string): ThemePalette {
  return themePalettes.some(({ id }) => id === value) ? value as ThemePalette : defaultPalette;
}

export function getThemeColor(palette: ThemePalette, theme: ResolvedTheme) {
  return palette === "matugen" ? matugenTheme?.[theme].appBg ?? themeColors.matugen[theme] : themeColors[palette][theme];
}

export function parseMatugenTheme(raw: string): MatugenTheme | null {
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    const readVariant = (theme: ResolvedTheme) => {
      const candidate = value[theme];
      if (!candidate || typeof candidate !== "object") return null;
      const tokens = candidate as Record<string, unknown>;
      if (!matugenTokenNames.every((name) => typeof tokens[name] === "string" && /^#[0-9a-f]{6,8}$/i.test(tokens[name]))) return null;
      return Object.fromEntries(matugenTokenNames.map((name) => [name, tokens[name]])) as Record<MatugenTokenName, string>;
    };
    const light = readVariant("light");
    const dark = readVariant("dark");
    return light && dark ? { light, dark } : null;
  } catch {
    return null;
  }
}

function currentPalette() {
  return resolvePalette(settings.get<string>("appearance.palette", defaultPalette));
}

function clearMatugenProperties() {
  for (const property of Object.values(matugenCssProperties)) document.documentElement.style.removeProperty(property);
  document.documentElement.style.removeProperty("--hero-bg");
  document.documentElement.style.removeProperty("--shadow");
}

function applyMatugenProperties(theme: ResolvedTheme) {
  const tokens = matugenTheme?.[theme];
  if (!tokens) return;
  for (const name of matugenTokenNames) document.documentElement.style.setProperty(matugenCssProperties[name], tokens[name]);
  document.documentElement.style.setProperty("--hero-bg", `linear-gradient(135deg, ${tokens.surfaceStrong}, ${tokens.greenSoft})`);
  document.documentElement.style.setProperty("--shadow", theme === "dark" ? "0 18px 50px rgba(0,0,0,.3)" : "0 18px 50px rgba(40,40,40,.12)");
}

function applyTheme(mode: ThemeMode, palette = currentPalette()) {
  const theme = resolveTheme(mode, window.matchMedia(preference).matches);
  if (palette === "matugen") applyMatugenProperties(theme);
  else clearMatugenProperties();
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.palette = palette;
  document.documentElement.style.colorScheme = theme;
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute("content", getThemeColor(palette, theme));
}

async function refreshMatugenTheme() {
  if (currentPalette() !== "matugen" || !("__TAURI_INTERNALS__" in window)) return;
  try {
    const raw = await invoke<string | null>("read_matugen_theme");
    const parsed = raw ? parseMatugenTheme(raw) : null;
    if (!parsed) return;
    matugenTheme = parsed;
    applyTheme(settings.get<ThemeMode>("appearance.theme", "auto"), "matugen");
  } catch (error) {
    console.warn("Could not load the Matugen palette.", error);
  }
}

export function setThemeMode(mode: ThemeMode) {
  settings.set("appearance.theme", mode);
  applyTheme(mode);
}

export function setThemePalette(palette: ThemePalette) {
  settings.set("appearance.palette", palette);
  applyTheme(settings.get<ThemeMode>("appearance.theme", "auto"), palette);
  if (palette === "matugen") void refreshMatugenTheme();
}

export function initializeTheme() {
  applyTheme(settings.get<ThemeMode>("appearance.theme", "auto"));
  void refreshMatugenTheme();
  window.setInterval(() => void refreshMatugenTheme(), 3000);
  window.matchMedia(preference).addEventListener("change", () => {
    const mode = settings.get<ThemeMode>("appearance.theme", "auto");
    if (mode === "auto") applyTheme(mode);
  });
}
