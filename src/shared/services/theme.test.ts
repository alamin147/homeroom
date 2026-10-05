import { describe, expect, it } from "vitest";
import { getThemeColor, parseMatugenTheme, resolvePalette, resolveTheme } from "./theme";

describe("resolveTheme", () => {
  it("uses the system preference in auto mode", () => {
    expect(resolveTheme("auto", true)).toBe("dark");
    expect(resolveTheme("auto", false)).toBe("light");
  });

  it("keeps an explicit theme", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});

describe("resolvePalette", () => {
  it("keeps a known palette", () => {
    expect(resolvePalette("gruvbox")).toBe("gruvbox");
    expect(resolvePalette("tokyo-night")).toBe("tokyo-night");
    expect(resolvePalette("matugen")).toBe("matugen");
  });

  it("falls back when a stored palette is unknown", () => {
    expect(resolvePalette("missing")).toBe("homeroom");
  });

  it("provides a light and dark browser color", () => {
    expect(getThemeColor("solarized", "light")).toBe("#fdf6e3");
    expect(getThemeColor("solarized", "dark")).toBe("#002b36");
  });
});

describe("parseMatugenTheme", () => {
  const variant = Object.fromEntries([
    "appBg", "ink", "muted", "paper", "line", "green", "greenSoft", "amber", "accentHover",
    "sidebarBg", "surface", "surfaceStrong", "field", "surfaceSubtle", "surfaceHover", "readerCanvas",
    "track", "selected", "onAccent", "onAccentMuted",
  ].map((name) => [name, "#123456"]));

  it("accepts complete generated light and dark palettes", () => {
    expect(parseMatugenTheme(JSON.stringify({ light: variant, dark: variant }))?.dark.green).toBe("#123456");
  });

  it("rejects incomplete or unsafe generated values", () => {
    expect(parseMatugenTheme(JSON.stringify({ light: variant }))).toBeNull();
    expect(parseMatugenTheme(JSON.stringify({ light: variant, dark: { ...variant, ink: "red; color: pink" } }))).toBeNull();
  });
});
