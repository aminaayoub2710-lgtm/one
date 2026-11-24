// @vitest-environment jsdom
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { i18n } from "@/i18n";
import { DirectionProvider, useDirection, useDirectionValue } from "./DirectionContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLDivElement | null = null;

beforeEach(() => {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  // Reset the document element and i18next to the known baseline before each
  // test so assertions are independent of run order.
  document.documentElement.removeAttribute("dir");
  document.documentElement.removeAttribute("lang");
  void i18n.changeLanguage("en");
});

afterEach(() => {
  if (root) {
    flushSync(() => root!.unmount());
    root = null;
  }
  if (host) {
    host.remove();
    host = null;
  }
  document.documentElement.removeAttribute("dir");
  document.documentElement.removeAttribute("lang");
  void i18n.changeLanguage("en");
});

function render(ui: React.ReactNode) {
  flushSync(() => root!.render(ui));
}

function Capture() {
  const dir = useDirection();
  return (
    <div data-locale={dir.locale} data-direction={dir.direction} />
  );
}

describe("DirectionProvider", () => {
  it("mirrors the i18next language onto the document element on mount", () => {
    render(
      <DirectionProvider>
        <Capture />
      </DirectionProvider>,
    );
    expect(document.documentElement.getAttribute("lang")).toBe("en");
    expect(document.documentElement.getAttribute("dir")).toBe("ltr");
  });

  it("re-applies direction when i18next changes language", () => {
    render(
      <DirectionProvider>
        <Capture />
      </DirectionProvider>,
    );
    void i18n.changeLanguage("ar");
    flushSync(() => {});
    expect(document.documentElement.getAttribute("lang")).toBe("ar");
    expect(document.documentElement.getAttribute("dir")).toBe("rtl");
  });

  it("preserves a region suffix on the lang attribute", () => {
    render(
      <DirectionProvider>
        <Capture />
      </DirectionProvider>,
    );
    void i18n.changeLanguage("ur-PK");
    flushSync(() => {});
    expect(document.documentElement.getAttribute("lang")).toBe("ur-PK");
    expect(document.documentElement.getAttribute("dir")).toBe("rtl");
  });

  it("exposes the current direction via useDirectionValue", () => {
    let captured: string | null = null;
    function Probe() {
      captured = useDirectionValue();
      return null;
    }
    render(
      <DirectionProvider>
        <Probe />
      </DirectionProvider>,
    );
    expect(captured).toBe("ltr");
  });

  it("does not persist a locale to localStorage", () => {
    render(
      <DirectionProvider>
        <Capture />
      </DirectionProvider>,
    );
    expect(window.localStorage.getItem("paperclip.locale")).toBeNull();
  });
});