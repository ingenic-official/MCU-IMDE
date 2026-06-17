import type { Component } from "vue";
import ModernTheme from "./modern";

export type ThemeKey = "modern" | "default";

export const defaultThemeKey: ThemeKey = "modern";

const themeRegistry: Record<ThemeKey, Component> = {
  modern: ModernTheme,
  default: ModernTheme, // fallback alias
};

export function resolveTheme(_theme?: string): Component {
  return ModernTheme;
}

export function getAvailableThemes(): ThemeKey[] {
  return Object.keys(themeRegistry) as ThemeKey[];
}

export default resolveTheme;
