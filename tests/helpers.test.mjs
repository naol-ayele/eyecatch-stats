import { describe, it, expect } from "vitest";
import { esc, errorCard, textWidth, hexPoints } from "../lib/helpers.js";

describe("esc", () => {
  it("escapes & < > \" '", () => {
    expect(esc(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });

  it("passes through safe strings", () => {
    expect(esc("hello world")).toBe("hello world");
  });

  it("handles empty string", () => {
    expect(esc("")).toBe("");
  });

  it("handles numbers", () => {
    expect(esc(42)).toBe("42");
  });
});

describe("errorCard", () => {
  it("returns an SVG string", () => {
    const svg = errorCard("test error");
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("test error");
  });

  it("truncates message beyond 70 chars", () => {
    const long = "a".repeat(100);
    const svg = errorCard(long);
    expect(svg).toContain("a".repeat(70));
    expect(svg).not.toContain("a".repeat(71));
  });

  it("includes error aria label", () => {
    const svg = errorCard("fail");
    expect(svg).toContain('aria-label="Error"');
  });

  it("handles empty message", () => {
    const svg = errorCard("");
    expect(svg).toContain("<svg");
  });
});

describe("textWidth", () => {
  it("estimates width proportionally to length", () => {
    expect(textWidth("hello")).toBe(5 * 12 * 0.58);
  });

  it("uses custom font size", () => {
    expect(textWidth("hi", 16)).toBe(2 * 16 * 0.58);
  });

  it("handles empty string", () => {
    expect(textWidth("")).toBe(0);
  });
});

describe("hexPoints", () => {
  it("returns 6 points for a hexagon", () => {
    const result = hexPoints(100, 100, 30);
    const points = result.split(" ");
    expect(points).toHaveLength(6);
  });

  it("each point has x,y format", () => {
    const result = hexPoints(50, 50, 20);
    result.split(" ").forEach((p) => {
      expect(p).toMatch(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/);
    });
  });
});
