export type ThemeMode = "system" | "light" | "dark";

export interface ThemePreferences {
  mode: ThemeMode;
}

const THEME_STORAGE_KEY = "logi.settings.theme.v1";
const SETTINGS_STORAGE_KEY = "logi.settings.basic.v2";

const LIGHT_PALETTE = {
  primary: "#5848F4",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
};

const DARK_PALETTE = {
  primary: "#9B87F5",
  background: "#151521",
  surface: "#1F2030",
  text: "#F1F2F8",
  muted: "#B2B4C6",
  border: "#36384C",
};

let detachSystemThemeListener: (() => void) | null = null;

const resolveSystemMode = (): Exclude<ThemeMode, "system"> => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const normalizeThemeMode = (mode: unknown): ThemeMode => {
  if (mode === "light" || mode === "dark" || mode === "system") {
    return mode;
  }

  // Backward compatibility: old "custom" is mapped to dark.
  if (mode === "custom") {
    return "dark";
  }

  return "system";
};

const applyPaletteToDocument = (mode: Exclude<ThemeMode, "system">) => {
  if (typeof document === "undefined") {
    return;
  }

  const palette = mode === "dark" ? DARK_PALETTE : LIGHT_PALETTE;
  const root = document.documentElement;

  root.dataset.theme = mode;
  root.style.colorScheme = mode;

  root.style.setProperty("--theme-primary", palette.primary);
  root.style.setProperty("--theme-background", palette.background);
  root.style.setProperty("--theme-surface", palette.surface);
  root.style.setProperty("--theme-text", palette.text);
  root.style.setProperty("--theme-muted", palette.muted);
  root.style.setProperty("--theme-border", palette.border);
};

const syncSystemTheme = (mode: ThemeMode) => {
  if (detachSystemThemeListener) {
    detachSystemThemeListener();
    detachSystemThemeListener = null;
  }

  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return;
  }

  if (mode !== "system") {
    return;
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handleChange = () => {
    applyPaletteToDocument(resolveSystemMode());
  };

  mediaQuery.addEventListener("change", handleChange);
  detachSystemThemeListener = () => mediaQuery.removeEventListener("change", handleChange);
};

const fromLegacySettingsStorage = (): ThemePreferences | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<Record<string, unknown>>;
    return { mode: normalizeThemeMode(parsed.theme) };
  } catch {
    return null;
  }
};

export const getStoredThemePreferences = (): ThemePreferences => {
  if (typeof window === "undefined") {
    return { mode: "system" };
  }

  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ThemePreferences>;
      return { mode: normalizeThemeMode(parsed.mode) };
    }
  } catch {
    // Fallback to legacy storage below.
  }

  return fromLegacySettingsStorage() ?? { mode: "system" };
};

export const saveThemePreferences = (preferences: ThemePreferences) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    THEME_STORAGE_KEY,
    JSON.stringify({ mode: normalizeThemeMode(preferences.mode) }),
  );
};

export const applyThemePreferences = (preferences: ThemePreferences) => {
  const mode = normalizeThemeMode(preferences.mode);
  const effectiveMode = mode === "system" ? resolveSystemMode() : mode;

  applyPaletteToDocument(effectiveMode);
  syncSystemTheme(mode);
};

export const initializeThemePreferences = () => {
  applyThemePreferences(getStoredThemePreferences());
};
