// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  RTL_LOCALES,
  applyDirection,
  directionForLocale,
  htmlLangForLocale,
  isRtlLocale,
} from "./direction";

describe("locale → direction mapping", () => {
  it("declares the RTL locales explicitly", () => {
    expect([...RTL_LOCALES]).toEqual(["ar", "fa", "he", "ps", "ur", "yi"]);
  });

  it.each([...RTL_LOCALES])("treats %s as RTL", (locale) => {
    expect(isRtlLocale(locale)).toBe(true);
    expect(directionForLocale(locale)).toBe("rtl");
  });

  it.each(["en", "de", "fr", "zh-CN", "ja", "ko", "tr", "nl"])(
    "treats %s as LTR",
    (locale) => {
      expect(isRtlLocale(locale)).toBe(false);
      expect(directionForLocale(locale)).toBe("ltr");
    },
  );

  it("matches the base language even when a region suffix is present", () => {
    expect(isRtlLocale("ar-EG")).toBe(true);
    expect(isRtlLocale("fa-IR")).toBe(true);
    expect(isRtlLocale("zh-CN")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isRtlLocale("AR")).toBe(true);
    expect(isRtlLocale("Fa")).toBe(true);
  });

  it("returns ltr for null/empty input", () => {
    expect(isRtlLocale(null)).toBe(false);
    expect(isRtlLocale(undefined)).toBe(false);
    expect(isRtlLocale("")).toBe(false);
    expect(directionForLocale(null)).toBe("ltr");
  });

  it("preserves the full locale string for the lang attribute", () => {
    expect(htmlLangForLocale("ar-EG")).toBe("ar-EG");
    expect(htmlLangForLocale("")).toBe("en");
    expect(htmlLangForLocale(null)).toBe("en");
  });
});

describe("applyDirection (document side effect)", () => {
  it("sets dir and lang on the document element for RTL locales", () => {
    const dir = applyDirection("ar");
    expect(dir).toBe("rtl");
    expect(document.documentElement.getAttribute("dir")).toBe("rtl");
    expect(document.documentElement.getAttribute("lang")).toBe("ar");
  });

  it("sets dir and lang on the document element for LTR locales", () => {
    const dir = applyDirection("en");
    expect(dir).toBe("ltr");
    expect(document.documentElement.getAttribute("dir")).toBe("ltr");
    expect(document.documentElement.getAttribute("lang")).toBe("en");
  });

  it("preserves a region suffix on the lang attribute", () => {
    applyDirection("ur-PK");
    expect(document.documentElement.getAttribute("lang")).toBe("ur-PK");
    expect(document.documentElement.getAttribute("dir")).toBe("rtl");
  });

  it("returns the direction that was applied", () => {
    expect(applyDirection("fa")).toBe("rtl");
    expect(applyDirection("de")).toBe("ltr");
  });
});