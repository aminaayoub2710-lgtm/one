import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { i18n } from "@/i18n";
import {
  applyDirection,
  directionForLocale,
  htmlLangForLocale,
  type TextDirection,
} from "@/i18n/direction";

export interface DirectionContextValue {
  locale: string;
  direction: TextDirection;
}

const DirectionContext = createContext<DirectionContextValue | undefined>(undefined);

/**
 * DirectionProvider is a READ-ONLY observer of i18next.
 *
 * It owns no locale state and writes nothing to localStorage. The single
 * source of truth for the active language is i18n (`i18n.language`), which
 * is initialised in `i18n/index.ts` and would be changed by a future language
 * selector calling `i18n.changeLanguage(...)`. This provider only mirrors
 * that one state onto `document.documentElement.dir`/`lang`, and re-syncs on
 * every `languageChanged` event so the document attribute can never drift
 * from the active language.
 *
 * Splitting direction out of the theme provider keeps the two concerns
 * independent: theme toggles a class, direction toggles an attribute.
 */
export function DirectionProvider({ children }: { children: ReactNode }) {
  const locale = i18n.language ?? "en";
  const direction = directionForLocale(locale);

  useEffect(() => {
    applyDirection(locale);
  }, [locale]);

  // Re-apply whenever i18next changes language through any path (a future
  // language selector, a backend-driven locale, or a direct i18n call).
  useEffect(() => {
    const handleLanguageChange = (nextLocale: string) => {
      applyDirection(nextLocale);
    };
    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, []);

  const value = useMemo<DirectionContextValue>(
    () => ({ locale, direction }),
    [locale, direction],
  );

  return (
    <DirectionContext.Provider value={value}>{children}</DirectionContext.Provider>
  );
}

export function useDirection() {
  const context = useContext(DirectionContext);
  if (!context) {
    throw new Error("useDirection must be used within DirectionProvider");
  }
  return context;
}

/** Convenience accessor that does not subscribe to changes. Useful for
 *  rendering a single `dir` attribute or class. */
export function useDirectionValue(): TextDirection {
  const { direction } = useDirection();
  return direction;
}

export { htmlLangForLocale };