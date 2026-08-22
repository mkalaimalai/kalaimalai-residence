import { describe, it, expect } from "vitest";
import { resolveImageUrl } from "./index";

describe("resolveImageUrl", () => {
  it("returns empty string for empty path", () => {
    expect(resolveImageUrl("", "https://example.com")).toBe("");
  });

  it("passes through absolute URLs", () => {
    expect(resolveImageUrl("https://cdn.example.com/img.jpg", "https://site.com")).toBe(
      "https://cdn.example.com/img.jpg",
    );
  });

  it("resolves root-relative path against origin", () => {
    expect(resolveImageUrl("/images/spaces/x.jpg", "https://site.com")).toBe(
      "https://site.com/images/spaces/x.jpg",
    );
  });

  it("handles trailing slash on origin", () => {
    expect(resolveImageUrl("/images/spaces/x.jpg", "https://site.com/")).toBe(
      "https://site.com/images/spaces/x.jpg",
    );
  });

  it("adds leading slash when missing", () => {
    expect(resolveImageUrl("images/spaces/x.jpg", "https://site.com")).toBe(
      "https://site.com/images/spaces/x.jpg",
    );
  });
});
