import { describe, it, expect } from "vitest";
import { cn, formatINR, landedFromEUR } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });
});

describe("formatINR", () => {
  it("formats whole rupees in Indian notation", () => {
    expect(formatINR(1234567)).toBe("₹12,34,567");
  });

  it("handles zero", () => {
    expect(formatINR(0)).toBe("₹0");
  });

  it("handles small amounts", () => {
    expect(formatINR(500)).toBe("₹500");
  });
});

describe("landedFromEUR", () => {
  it("calculates landed cost with default multiplier", () => {
    expect(landedFromEUR(10000, 90)).toBe(1575000);
  });

  it("uses custom multiplier", () => {
    expect(landedFromEUR(10000, 90, 1.5)).toBe(1350000);
  });

  it("rounds to nearest integer", () => {
    expect(landedFromEUR(123, 88.5)).toBe(19050);
  });
});
