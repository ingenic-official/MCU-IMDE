import { Menu, menuType } from "./Menu";

// ---- Numeric helpers ----

export function parseKconfigNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const sign = trimmed.startsWith("-") ? -1 : 1;
  const unsigned = trimmed[0] === "+" || trimmed[0] === "-" ? trimmed.slice(1) : trimmed;
  if (!unsigned) {
    return null;
  }

  let parsed: number;
  if (/^0[xX][0-9a-fA-F]+$/.test(unsigned)) {
    parsed = Number.parseInt(unsigned.slice(2), 16);
  } else if (/^0[bB][01]+$/.test(unsigned)) {
    parsed = Number.parseInt(unsigned.slice(2), 2);
  } else if (/^0[oO][0-7]+$/.test(unsigned)) {
    parsed = Number.parseInt(unsigned.slice(2), 8);
  } else if (/^[0-9]+$/.test(unsigned)) {
    parsed = Number.parseInt(unsigned, 10);
  } else {
    return null;
  }

  return Number.isNaN(parsed) ? null : sign * parsed;
}

export function clampNumberToRange(value: number, range?: number[]): number {
  if (!range || range.length < 2) {
    return value;
  }
  const [min, max] = range;
  let next = value;
  if (Number.isFinite(min) && next < min) {
    next = min;
  }
  if (Number.isFinite(max) && next > max) {
    next = max;
  }
  return next;
}

export function normalizeIntValue(value: unknown, range?: number[]): number | null {
  const parsed = parseKconfigNumber(value);
  return parsed === null ? null : clampNumberToRange(parsed, range);
}

export function normalizeHexValue(value: unknown, range?: number[]): string {
  const parsed = parseHexNumber(value);
  if (parsed === null) {
    return "";
  }
  const clamped = clampNumberToRange(parsed, range);
  const sign = clamped < 0 ? "-" : "";
  return `${sign}0x${Math.abs(clamped).toString(16).toUpperCase()}`;
}

function parseHexNumber(value: unknown): number | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^[0-9a-fA-F]+$/.test(trimmed)) {
      return Number.parseInt(trimmed, 16);
    }
  }
  return parseKconfigNumber(value);
}

// ---- String helpers ----

export function stripKconfigQuotes(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= 2) {
    const quote = trimmed[0];
    if ((quote === '"' || quote === "'") && trimmed[trimmed.length - 1] === quote) {
      return trimmed.slice(1, -1);
    }
  }
  return value;
}

export function unescapeKconfigString(value: string): string {
  let result = "";
  let escaped = false;

  for (const ch of value) {
    if (escaped) {
      switch (ch) {
        case "n":
          result += "\n";
          break;
        case "t":
          result += "\t";
          break;
        case '"':
        case "\\":
          result += ch;
          break;
        default:
          result += `\\${ch}`;
          break;
      }
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      escaped = true;
      continue;
    }

    result += ch;
  }

  if (escaped) {
    result += "\\";
  }

  return result;
}

export function normalizeConfigStringValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return unescapeKconfigString(stripKconfigQuotes(String(value)));
}

// ---- Tristate helpers ----

export const TRISTATE_ORDER: Array<"n" | "m" | "y"> = ["n", "m", "y"];

export function normalizeTristateValue(value: unknown): "n" | "m" | "y" {
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower === "y" || lower === "m" || lower === "n") {
      return lower as "n" | "m" | "y";
    }
    if (lower === "true" || lower === "2") return "y";
    if (lower === "1") return "m";
    return "n";
  }
  if (typeof value === "number") {
    if (value >= 2) return "y";
    if (value === 1) return "m";
    return "n";
  }
  if (typeof value === "boolean") return value ? "y" : "n";
  return "n";
}

export function clampTristateValue(
  allowed: Array<"n" | "m" | "y">,
  current: "n" | "m" | "y",
  order: Array<"n" | "m" | "y"> = TRISTATE_ORDER,
): "n" | "m" | "y" {
  const currentIndex = order.indexOf(current);
  if (currentIndex === -1) return allowed[0];
  for (let i = currentIndex; i < order.length; i++) {
    if (allowed.includes(order[i])) return order[i];
  }
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (allowed.includes(order[i])) return order[i];
  }
  return allowed[0];
}

export function getMenuTriStrength(menu: Menu | null): number {
  if (!menu) return 0;
  const value = menu.value;
  if (menu.type === menuType.bool) {
    if (value === true || value === "y" || value === 2) return 2;
    return 0;
  }
  if (menu.type === menuType.tristate) {
    if (value === "y" || value === true || value === 2) return 2;
    if (value === "m" || value === 1) return 1;
    return 0;
  }
  return 0;
}

// ---- Value comparison ----

export function areMenuValuesEqual(a: unknown, b: unknown, type: menuType): boolean {
  switch (type) {
    case menuType.int:
      return parseKconfigNumber(a) === parseKconfigNumber(b);
    case menuType.hex:
      return normalizeHexValue(a).toLowerCase() === normalizeHexValue(b).toLowerCase();
    default:
      return a === b;
  }
}

// ---- Pure helpers ----

export function isKeyword(str: string): boolean {
  const keywords = new Set(["TRUE", "FALSE", "Y", "N", "M"]);
  return keywords.has(str.toUpperCase());
}

export function getFallbackValueForType(type: menuType): unknown {
  switch (type) {
    case menuType.bool: return false;
    case menuType.tristate: return "n";
    case menuType.int: return 0;
    case menuType.hex: return "0x0";
    case menuType.string: return "";
    default: return null;
  }
}
