/**
 * Locale → text-direction mapping.
 *
 * Paperclip ships 36 locales but never set `dir` on the document, so every
 * page rendered left-to-right even for RTL scripts. This module is the single
 * source of truth for which locales are RTL, and it owns the side effect of
 * applying `dir`/`lang` to `document.documentElement`.
 *
 * The list is deliberately explicit rather than derived from Unicode ranges:
 * a locale code is a product decision ("this UI is available in Arabic"), not
 * a property of the script, and the Owner should not have to maintain a
 * script table when a locale is added or removed.
 */

export type TextDirection = "ltr" | "rtl";

/** Locales whose script is written right-to-left. Everything else is ltr. */
export const RTL_LOCALES = [
  "ar",
  "fa",
  "he",
  "ps",
  "ur",
  "yi",
] as const;

export type RtlLocale = (typeof RTL_LOCALES)[number];

const RTL_SET = new Set<string>(RTL_LOCALES);

export function isRtlLocale(locale: string | null | undefined): boolean {
  if (!locale) return false;
  // Normalise `pt-BR` → `pt` before lookup so a region suffix never hides a
  // base-language match. Only the base language can be RTL here.
  const base = locale.split("-")[0]?.toLowerCase() ?? "";
  return RTL_SET.has(base);
}

export function directionForLocale(locale: string | null | undefined): TextDirection {
  return isRtlLocale(locale) ? "rtl" : "ltr";
}

/** The `lang` attribute value to set on the document root. */
export function htmlLangForLocale(locale: string | null | undefined): string {
  return locale && locale.trim().length > 0 ? locale.trim() : "en";
}

/**
 * Apply the direction to the document root. Safe to call during SSR guards:
 * it no-ops when `document` is unavailable.
 *
 * Returns the direction that was applied so callers can react to a change
 * without re-reading the DOM.
 */
export function applyDirection(locale: string | null | undefined): TextDirection {
  if (typeof document === "undefined") return directionForLocale(locale);
  const direction = directionForLocale(locale);
  const root = document.documentElement;
  root.setAttribute("dir", direction);
  root.setAttribute("lang", htmlLangForLocale(locale));
  return direction;
}